import { appStorage } from "@/cacheMMKV/cacheConfig";
import {
  firestore,
  getDocsFromServer,
  collection,
  queryFs,
  where,
  orderBy,
  limit,
  Timestamp, // Ensure Timestamp is exported from your firebase config
} from "@/config/firebase";
import { gunzipSync, strFromU8 } from "fflate";
import { db } from "@/db/client";
import { sqlProfileTable } from "@/db/schema/sqlprofiles";
import { sql } from "drizzle-orm";

const CDN_BASE_URL = "https://cdn.yourdomain.com";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

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

  // 1. Already numeric milliseconds
  if (typeof value === "number") return value;

  // 2. Firestore Timestamp object (.toMillis())
  if (typeof value?.toMillis === "function") return value.toMillis();

  // 3. JS Date Object
  if (value instanceof Date) return value.getTime();

  // 4. ISO String (e.g. "2026-06-22T16:15:23.462Z")
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
 * Main Sync Entry Point
 */
export const syncFeedProfiles = async (
  isPaid: boolean,
  userGender?: string | null,
): Promise<number> => {
  const targetCollection = getTargetCollection(userGender);
  if (!targetCollection) return 0;

  if (!isPaid) {
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
): Promise<number> => {
  const isCompleted = appStorage.getBoolean(
    `is_initial_sync_done_${targetCollection}`,
  );
  if (isCompleted) return 0;

  console.log("isCompleted bulk sync:", isCompleted);
  console.log(
    "Started bulk sync via handlePaidBulkSync for target collection:",
    targetCollection,
  );

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
      const chunk = rawProfiles.slice(i, i + chunkSize).map((p: any) => {
        const { item, updatedAt } = mapRawToProfileSchema(p);
        if (updatedAt > maxTimestamp) maxTimestamp = updatedAt;
        return item;
      });

      tx.insert(sqlProfileTable)
        .values(chunk)
        .onConflictDoUpdate({
          target: sqlProfileTable.uid,
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

  const now = Date.now();
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
  const freeQuery = queryFs(
    collection(firestore, targetCollection),
    orderBy("createdAt", "desc"),
    limit(15),
  );

  const snapshot = await getDocsFromServer(freeQuery);
  if (snapshot.empty) return 0;

  const freeProfiles = snapshot.docs.map((doc: any) => {
    const data = doc.data();
    return mapRawToProfileSchema({ uid: doc.id, ...data }).item;
  });

  db.transaction((tx) => {
    for (const item of freeProfiles) {
      tx.insert(sqlProfileTable)
        .values(item)
        .onConflictDoUpdate({
          target: sqlProfileTable.uid,
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

  console.log("handleFreeTierSync done with profiles:", freeProfiles?.length);

  return freeProfiles?.length;
};

/**
 * Delta Sync: Incremental update handler with 24-hour interval control
 */
export const performDeltaSync = async (
  isPaid: boolean,
  gender: string | null | undefined,
  forceSync: boolean = false,
): Promise<number> => {
  if (!isPaid) return 0;

  const targetCollection = getTargetCollection(gender);
  if (!targetCollection) return 0;

  console.log(
    "Started performDeltaSync for target collection:",
    targetCollection,
  );

  const now = Date.now();
  const lastRunTime =
    appStorage.getNumber(`last_delta_run_${targetCollection}`) || 0;

  // Enforce 24-hour throttling unless forced
  if (!forceSync && now - lastRunTime < TWENTY_FOUR_HOURS_MS) {
    return 0;
  }

  const lastSyncedAt = appStorage.getNumber("last_synced_at") || 0;

  console.log("performDeltaSync lastSyncedAt:", lastSyncedAt);

  // Convert numeric timestamp to Firestore Timestamp instance for query compatibility
  const filterTimestamp =
    lastSyncedAt > 0
      ? Timestamp.fromMillis(lastSyncedAt)
      : Timestamp.fromMillis(0);

  const deltaQuery = queryFs(
    collection(firestore, targetCollection),
    where("updatedAt", ">", filterTimestamp),
  );

  const snapshot = await getDocsFromServer(deltaQuery);

  // Update last run time regardless of whether new updates existed
  appStorage.set(`last_delta_run_${targetCollection}`, now);

  if (snapshot.empty) return 0;

  let latestTimestamp = lastSyncedAt;

  const updates = snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const { item, updatedAt } = mapRawToProfileSchema({
      uid: doc.id,
      ...data,
    });
    if (updatedAt > latestTimestamp) latestTimestamp = updatedAt;
    return item;
  });

  db.transaction((tx) => {
    for (const item of updates) {
      tx.insert(sqlProfileTable)
        .values(item)
        .onConflictDoUpdate({
          target: sqlProfileTable.uid,
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

  console.log("performDeltaSync updated profile length:", updates?.length);

  appStorage.set("last_synced_at", latestTimestamp);
  return updates.length;
};
