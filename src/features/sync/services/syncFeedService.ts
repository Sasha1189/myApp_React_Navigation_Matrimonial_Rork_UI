import { appStorage } from "@/cacheMMKV/cacheConfig";
import {
  firestore,
  getDocsFromServer,
  collection,
  queryFs,
  where,
  orderBy,
  limit,
  Timestamp,
} from "@/config/firebase";
import { gunzipSync, strFromU8 } from "fflate";
import { db } from "@/db/client";
import { resolveFeedTable } from "@/features/home/services/feedRepository";
import { freeUserFeeds, paidUserFeeds } from "@/db/schema/sqlprofiles";
import { sql, inArray } from "drizzle-orm";

const CDN_BASE_URL = "https://cdn.yourdomain.com";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const SQLITE_DELETE_CHUNK_SIZE = 500;

/**
 * Utility: Determines target Firestore collection based on user's gender
 */
const getTargetCollection = (gender?: string | null): string | null => {
  if (!gender || typeof gender !== "string") return null;
  const normalized = gender.toLowerCase().trim();
  if (normalized === "male") return "femaleProfiles";
  if (normalized === "female") return "maleProfiles";
  return null;
};

/**
 * Utility: Safely parses Firestore Timestamps, Date objects, or numeric millis
 */
const parseTimestamp = (value: any): number => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  }
  return 0;
};

/**
 * Helper: Normalizes raw object fields to match Drizzle short-key schema
 */
const mapRawToProfileSchema = (p: any) => {
  const parsedCreatedAt = parseTimestamp(p.createdAt ?? p.ca);
  const parsedUpdatedAt = parseTimestamp(p.updatedAt ?? p.ua);

  return {
    item: {
      uid: p.uid || p.id,
      ca: parsedCreatedAt,
      ua: parsedUpdatedAt,
      fn: p.fn ?? p.fullName ?? "",
      ln: p.ln ?? p.lastName ?? "",
      db: p.db ? parseTimestamp(p.db) : parseTimestamp(p.dob),
      ht: p.ht ?? p.heightCm ?? 0,
      np: p.np ?? p.nativePlace ?? p.location ?? "",
      ai: p.ai ?? p.annualIncome ?? 0,
      ms: p.ms ?? p.maritalStatus ?? 0,
      ir: p.ir ?? p.isReady ?? "",
      profileData: JSON.stringify(p),
    },
    updatedAt: parsedUpdatedAt,
  };
};

/**
 * Helper: Safely purges inactive UIDs from SQLite in safe batch sizes
 */
const purgeInactiveBatchFromTx = (tx: any, uids: string[]) => {
  if (!uids || uids.length === 0) return;

  for (let i = 0; i < uids.length; i += SQLITE_DELETE_CHUNK_SIZE) {
    const chunk = uids.slice(i, i + SQLITE_DELETE_CHUNK_SIZE);
    tx.delete(paidUserFeeds).where(inArray(paidUserFeeds.uid, chunk)).run();
  }
};

/**
 * Main Sync Entry Point
 */
export const syncFeedProfiles = async (
  isPaid: boolean,
  isVerified: boolean,
  userGender?: string | null,
): Promise<number> => {
  const targetCollection = getTargetCollection(userGender);
  if (!targetCollection) return 0;

  if (isPaid && isVerified) {
    //for time being testing
    await handleFreeTierSync(targetCollection);
    return await handlePaidBulkSync(targetCollection);
  } else {
    return await handleFreeTierSync(targetCollection);
  }
};

/**
 * Paid User Flow: Dynamic Sharded CDN Gzip Download
 */
const handlePaidBulkSync = async (
  targetCollection: string,
  overrideIsFree?: boolean,
): Promise<number> => {
  const isCompleted = appStorage.getBoolean(
    `is_initial_sync_done_${targetCollection}`,
  );
  if (isCompleted) return 0;

  const table = resolveFeedTable(overrideIsFree);
  // Only proceed for paid-user feeds; otherwise skip the bulk sync.
  if (table !== paidUserFeeds) {
    return 0;
  }

  const bundleUrl = `${CDN_BASE_URL}/${targetCollection}_dump.json.gz`;
  const response = await fetch(bundleUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch bulk dump from ${bundleUrl}`);
  }

  const blob = await response.arrayBuffer();
  const decompressed = gunzipSync(new Uint8Array(blob));
  const rawProfiles = JSON.parse(strFromU8(decompressed));

  let maxTimestamp = 0;

  db.transaction((tx) => {
    const chunkSize = 1000;

    for (let i = 0; i < rawProfiles.length; i += chunkSize) {
      const rawChunk = rawProfiles.slice(i, i + chunkSize);
      const itemsToUpsert: any[] = [];
      const uidsToDelete: string[] = [];

      for (const p of rawChunk) {
        const uid = p.uid || p.id;
        if (!uid) continue;

        // 🛑 Check for inactive status (ia === false)
        if (p.ia === false) {
          uidsToDelete.push(uid);
        } else {
          const { item, updatedAt } = mapRawToProfileSchema(p);
          if (updatedAt > maxTimestamp) maxTimestamp = updatedAt;
          itemsToUpsert.push(item);
        }
      }

      // 1. Delete inactive profiles from SQLite
      purgeInactiveBatchFromTx(tx, uidsToDelete);

      // 2. Upsert valid active profiles into SQLite
      if (itemsToUpsert.length > 0) {
        tx.insert(table)
          .values(itemsToUpsert)
          .onConflictDoUpdate({
            target: table.uid,
            set: {
              ca: sql`excluded.ca`,
              ua: sql`excluded.ua`,
              fn: sql`excluded.fn`,
              ln: sql`excluded.ln`,
              db: sql`excluded.db`,
              ht: sql`excluded.ht`,
              np: sql`excluded.np`,
              ai: sql`excluded.ai`,
              ms: sql`excluded.ms`,
              ir: sql`excluded.ir`,
              profileData: sql`excluded.profile_data`,
            },
          })
          .run();
      }
    }
  });

  const now = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 50));
  appStorage.set(`is_initial_sync_done_${targetCollection}`, true);
  appStorage.set("last_synced_at", maxTimestamp || now);
  appStorage.set(`last_delta_run_${targetCollection}`, now);
  return rawProfiles.length;
};

/**
 * Free User Flow: Fetch recent 15 profiles from targeted shard
 */
const handleFreeTierSync = async (
  targetCollection: string,
): Promise<number> => {
  const syncKey = `is_free_sync_done_${targetCollection}`;

  // 1. MMKV GUARD: Skip network query if initial free sync was already performed
  const isCompleted = appStorage.getBoolean(syncKey);
  if (isCompleted) {
    return 0;
  }

  const freeQuery = queryFs(
    collection(firestore, targetCollection),
    orderBy("createdAt", "desc"),
    limit(15),
  );

  const snapshot = await getDocsFromServer(freeQuery);
  if (snapshot.empty) return 0;

  const itemsToUpsert: any[] = [];
  const uidsToDelete: string[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    // 🛑 Check for inactive status (ia === false)
    if (data.ia === false) {
      uidsToDelete.push(uid);
    } else {
      const { item } = mapRawToProfileSchema({ uid, ...data });
      itemsToUpsert.push(item);
    }
  }

  db.transaction((tx) => {
    // 1. Delete inactive profiles
    purgeInactiveBatchFromTx(tx, uidsToDelete);

    // 2. Upsert active profiles
    if (itemsToUpsert.length > 0) {
      tx.insert(freeUserFeeds)
        .values(itemsToUpsert)
        .onConflictDoUpdate({
          target: freeUserFeeds.uid,
          set: {
            ca: sql`excluded.ca`,
            ua: sql`excluded.ua`,
            fn: sql`excluded.fn`,
            ln: sql`excluded.ln`,
            db: sql`excluded.db`,
            ht: sql`excluded.ht`,
            np: sql`excluded.np`,
            ai: sql`excluded.ai`,
            ms: sql`excluded.ms`,
            ir: sql`excluded.ir`,
            profileData: sql`excluded.profile_data`,
          },
        })
        .run();
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  appStorage.set(syncKey, true);

  return itemsToUpsert.length;
};

/**
 * Delta Sync: Incremental update handler with 24-hour interval control
 */
export const performDeltaSync = async (
  isPaid: boolean,
  isVerified: boolean,
  gender: string | null | undefined,
  forceSync: boolean = false,
  overrideIsFree?: boolean,
): Promise<number> => {
  if (!(isPaid && isVerified)) return 0;

  const table = resolveFeedTable(overrideIsFree);

  const targetCollection = getTargetCollection(gender);
  if (!targetCollection) return 0;

  const now = Date.now();
  const lastRunTime =
    appStorage.getNumber(`last_delta_run_${targetCollection}`) || 0;

  // Enforce 24-hour throttling unless forced
  if (!forceSync && now - lastRunTime < TWENTY_FOUR_HOURS_MS) {
    return 0;
  }

  const lastSyncedAt = appStorage.getNumber("last_synced_at") || 0;

  const filterTimestamp =
    lastSyncedAt > 0
      ? Timestamp.fromMillis(lastSyncedAt)
      : Timestamp.fromMillis(0);

  const deltaQuery = queryFs(
    collection(firestore, targetCollection),
    where("updatedAt", ">", filterTimestamp),
  );

  const snapshot = await getDocsFromServer(deltaQuery);

  appStorage.set(`last_delta_run_${targetCollection}`, now);

  if (snapshot.empty) return 0;

  let latestTimestamp = lastSyncedAt;
  const itemsToUpsert: any[] = [];
  const uidsToDelete: string[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;
    const { item, updatedAt } = mapRawToProfileSchema({ uid, ...data });

    // ⏱️ Always track timestamp progress so we don't re-query this record
    if (updatedAt > latestTimestamp) latestTimestamp = updatedAt;

    // 🛑 Check for inactive status (ia === false)
    if (data.ia === false) {
      uidsToDelete.push(uid);
    } else {
      itemsToUpsert.push(item);
    }
  }

  db.transaction((tx) => {
    // 1. Delete inactive profiles from SQLite
    purgeInactiveBatchFromTx(tx, uidsToDelete);

    // 2. Upsert updated active profiles into SQLite
    if (itemsToUpsert.length > 0) {
      tx.insert(table)
        .values(itemsToUpsert)
        .onConflictDoUpdate({
          target: table.uid,
          set: {
            ca: sql`excluded.ca`,
            ua: sql`excluded.ua`,
            fn: sql`excluded.fn`,
            ln: sql`excluded.ln`,
            db: sql`excluded.db`,
            ht: sql`excluded.ht`,
            np: sql`excluded.np`,
            ai: sql`excluded.ai`,
            ms: sql`excluded.ms`,
            ir: sql`excluded.ir`,
            profileData: sql`excluded.profile_data`,
          },
        })
        .run();
    }
  });

  appStorage.set("last_synced_at", latestTimestamp);
  return snapshot.docs.length;
};
