import { appStorage } from "@/cacheMMKV/cacheConfig";
import {
  firestore,
  getDocsFromServer,
  collection,
  queryFs,
  where,
  limit,
  Timestamp,
} from "@/config/firebase";
import { db } from "@/db/client";
import { freeUserFeeds, paidUserFeeds } from "@/db/schema/sqlprofiles";
import { sql, inArray } from "drizzle-orm";

const SQLITE_DELETE_CHUNK_SIZE = 500;
const UPSERT_CHUNK_SIZE = 1000;

export interface RawProfileData {
  uid?: string;
  id?: string;
  ca?: any;
  ua?: any;
  fn?: string;
  ln?: string;
  db?: any;
  ht?: number;
  np?: string;
  ai?: number;
  ms?: number;
  ir?: string;
  ia?: boolean;
  [key: string]: any;
}

export interface ProfileSchemaItem {
  uid: string;
  ca: number;
  ua: number | null;
  fn: string;
  ln: string;
  db: number | null;
  ht: number;
  np: string;
  ai: number;
  ms: number;
  ir: string;
  profileData: string;
}

const COLLECTION_MAP = {
  paid: { male: "femaleProfiles", female: "maleProfiles" },
  free: { male: "femaleDummy", female: "maleDummy" },
} as const;

const getTargetCollectionName = (
  gender?: string | null,
  isFree: boolean = false,
): string | null => {
  if (!gender || typeof gender !== "string" || !gender.trim()) return null;
  const normalized = gender.toLowerCase().trim() as "male" | "female";
  const tier = isFree ? "free" : "paid";
  return COLLECTION_MAP[tier][normalized] ?? null;
};

const parseTimestamp = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const num = Number(value);
    if (!isNaN(num)) return num;
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const mapRawToProfileSchema = (
  p: RawProfileData,
): { item: ProfileSchemaItem; updatedAt: number | null } => {
  const parsedCreatedAt = parseTimestamp(p.ca ?? null);
  const parsedUpdatedAt = parseTimestamp(p.ua ?? null);
  const parsedDb = parseTimestamp(p.db ?? null);

  return {
    item: {
      uid: (p.uid || p.id)!,
      ca: parsedCreatedAt!,
      ua: parsedUpdatedAt,
      fn: p.fn ?? "",
      ln: p.ln ?? "",
      db: parsedDb,
      ht: p.ht ?? 0,
      np: p.np ?? "",
      ai: p.ai ?? 0,
      ms: p.ms ?? 0,
      ir: p.ir ?? "",
      profileData: JSON.stringify(p),
    },
    updatedAt: parsedUpdatedAt,
  };
};
// Reusable SQL upsert target assignments
const UPSERT_CONFLICT_SET = {
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
};
/**
 * Helper: Safely purges inactive UIDs from SQLite in safe batch sizes
 */
const purgeInactiveBatchFromTx = (tx: any, table: any, uids: string[]) => {
  const safeUids = uids ?? [];
  if (safeUids.length === 0) return;
  for (let i = 0; i < safeUids.length; i += SQLITE_DELETE_CHUNK_SIZE) {
    const chunk = safeUids.slice(i, i + SQLITE_DELETE_CHUNK_SIZE);
    tx.delete(table).where(inArray(table.uid, chunk)).run();
  }
};

const upsertProfilesBatchFromTx = (
  tx: any,
  table: any,
  items: ProfileSchemaItem[],
) => {
  const safeItems = items ?? [];
  if (safeItems.length === 0) return;

  tx.insert(table)
    .values(items)
    .onConflictDoUpdate({
      target: table.uid,
      set: UPSERT_CONFLICT_SET,
    })
    .run();
};
/**
 * Helper: Standardizes raw profile chunk processing (Separates active/inactive & tracks latest timestamp)
 */
const processRawProfiles = (rawProfiles: RawProfileData[]) => {
  const itemsToUpsert: ProfileSchemaItem[] = [];
  const uidsToDelete: string[] = [];
  let maxTimestamp = 0;

  const safeProfiles = rawProfiles ?? [];
  for (const p of safeProfiles) {
    const uid = p.uid || p.id;
    if (!uid) continue;

    if (p.ia === false) {
      uidsToDelete.push(uid);
      continue;
    }

    const { item, updatedAt } = mapRawToProfileSchema(p);

    if (item.ca === null) {
      console.warn(
        `[Sync] Skipping profile ${uid} due to missing 'ca' timestamp.`,
      );
      continue;
    }

    if (updatedAt !== null && updatedAt > maxTimestamp) {
      maxTimestamp = updatedAt;
    }

    itemsToUpsert.push(item);
  }

  return { itemsToUpsert, uidsToDelete, maxTimestamp };
};
/**
 * Main Sync Entry Point
 */
export const syncFeedProfiles = async (
  isPaid: boolean,
  userGender: string,
): Promise<number> => {
  if (isPaid) {
    const targetCollection = getTargetCollectionName(userGender, false);
    if (!targetCollection) return 0;
    return await handlePaidBulkSync(targetCollection);
  } else {
    const targetCollectionFree = getTargetCollectionName(userGender, true);
    if (!targetCollectionFree) return 0;
    return await handleFreeTierSync(targetCollectionFree);
  }
};
/**
 * Paid User Flow: Fetch initial bulk profiles directly from Firestore
 */
const handlePaidBulkSync = async (
  targetCollection: string,
  overrideIsFree?: boolean,
): Promise<number> => {
  const syncKey = `is_initial_sync_done_${targetCollection}`;
  if (appStorage.getBoolean(syncKey)) return 0;

  const paidQuery = queryFs(collection(firestore, targetCollection), limit(50));
  const snapshot = await getDocsFromServer(paidQuery);
  if (snapshot.empty) return 0;

  const safeDocs = snapshot?.docs ?? [];
  const rawProfiles: RawProfileData[] = safeDocs.map(
    (docSnap: { id: string; data: () => Record<string, any> }) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }),
  );

  let maxTimestamp = 0;

  db.transaction((tx) => {
    for (let i = 0; i < rawProfiles?.length; i += UPSERT_CHUNK_SIZE) {
      const rawChunk = rawProfiles?.slice(i, i + UPSERT_CHUNK_SIZE);
      const {
        itemsToUpsert,
        uidsToDelete,
        maxTimestamp: chunkMaxTs,
      } = processRawProfiles(rawChunk);

      if (chunkMaxTs > maxTimestamp) {
        maxTimestamp = chunkMaxTs;
      }

      purgeInactiveBatchFromTx(tx, paidUserFeeds, uidsToDelete);
      upsertProfilesBatchFromTx(tx, paidUserFeeds, itemsToUpsert);
    }
  });

  const now = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 50));
  appStorage.set(syncKey, true);
  appStorage.set("last_synced_at", maxTimestamp || now);
  appStorage.set(`last_delta_run_${targetCollection}`, now);

  console.log("[handlePaidBulkSync] Synced records:", rawProfiles?.length);
  return rawProfiles?.length;
};
/**
 * Free User Flow: Fetch recent profiles for free-tier users
 */
const handleFreeTierSync = async (
  targetCollectionFree: string,
): Promise<number> => {
  const syncKey = `is_free_sync_done_${targetCollectionFree}`;
  if (appStorage.getBoolean(syncKey)) return 0;

  const freeQuery = queryFs(
    collection(firestore, targetCollectionFree),
    limit(15),
  );

  const snapshot = await getDocsFromServer(freeQuery);

  if (snapshot.empty) return 0;
  const safeDocs = snapshot?.docs ?? [];
  const rawProfiles: RawProfileData[] = safeDocs.map(
    (docSnap: { id: string; data: () => Record<string, any> }) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }),
  );

  const { itemsToUpsert } = processRawProfiles(rawProfiles);

  db.transaction((tx) => {
    upsertProfilesBatchFromTx(tx, freeUserFeeds, itemsToUpsert);
  });

  await new Promise((resolve) => setTimeout(resolve, 50));
  appStorage.set(syncKey, true);

  console.log("[handleFreeTierSync] Synced records:", itemsToUpsert?.length);
  return itemsToUpsert?.length;
};

/**
 * Delta Sync: Incremental update handler
 */
export const performDeltaSync = async (
  isPaid: boolean,
  gender: string,
): Promise<number> => {
  if (!isPaid) return 0;

  const targetCollection = getTargetCollectionName(gender, false);
  if (!targetCollection) return 0;

  const now = Date.now();

  const lastSyncedAt = appStorage.getNumber("last_synced_at") || 0;
  const filterTimestamp = Timestamp.fromMillis(lastSyncedAt);

  const deltaQuery = queryFs(
    collection(firestore, targetCollection),
    where("ua", ">", filterTimestamp),
  );

  const snapshot = await getDocsFromServer(deltaQuery);
  appStorage.set(`last_delta_run_${targetCollection}`, now);

  if (snapshot.empty) return 0;
  const safeDocs = snapshot?.docs ?? [];
  const rawProfiles: RawProfileData[] = safeDocs.map(
    (docSnap: { id: string; data: () => Record<string, any> }) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }),
  );

  const { itemsToUpsert, uidsToDelete, maxTimestamp } =
    processRawProfiles(rawProfiles);

  db.transaction((tx) => {
    purgeInactiveBatchFromTx(tx, paidUserFeeds, uidsToDelete);
    upsertProfilesBatchFromTx(tx, paidUserFeeds, itemsToUpsert);
  });

  if (maxTimestamp > lastSyncedAt) {
    appStorage.set("last_synced_at", maxTimestamp);
  }

  console.log("[performDeltaSync] Processed updates:", snapshot.docs?.length);
  return snapshot.docs?.length;
};

// const CDN_BASE_URL = "https://cdn.yourdomain.com";
// const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
// const SQLITE_DELETE_CHUNK_SIZE = 500;
// /**
//  * Paid User Flow: Dynamic Sharded CDN Gzip Download
//  */
// //Use later once we have cdn link
// // const handlePaidBulkSync = async (
// //   targetCollection: string,
// //   overrideIsFree?: boolean,
// // ): Promise<number> => {
// //   const isCompleted = appStorage.getBoolean(
// //     `is_initial_sync_done_${targetCollection}`,
// //   );
// //   if (isCompleted) return 0;

// //   const table = resolveFeedTable(overrideIsFree);
// //   // Only proceed for paid-user feeds; otherwise skip the bulk sync.
// //   if (table !== paidUserFeeds) {
// //     return 0;
// //   }

// //   const bundleUrl = `${CDN_BASE_URL}/${targetCollection}_dump.json.gz`;
// //   const response = await fetch(bundleUrl);

// //   if (!response.ok) {
// //     throw new Error(`Failed to fetch bulk dump from ${bundleUrl}`);
// //   }

// //   const blob = await response.arrayBuffer();
// //   const decompressed = gunzipSync(new Uint8Array(blob));
// //   const rawProfiles = JSON.parse(strFromU8(decompressed));

// //   let maxTimestamp = 0;

// //   db.transaction((tx) => {
// //     const chunkSize = 1000;

// //     for (let i = 0; i < rawProfiles.length; i += chunkSize) {
// //       const rawChunk = rawProfiles.slice(i, i + chunkSize);
// //       const itemsToUpsert: any[] = [];
// //       const uidsToDelete: string[] = [];

// //       for (const p of rawChunk) {
// //         const uid = p.uid || p.id;
// //         if (!uid) continue;

// //         // 1. Mark inactive profiles for deletion and move to next
// //         if (p.ia === false) {
// //           uidsToDelete.push(uid);
// //           continue;
// //         }

// //         const { item, updatedAt } = mapRawToProfileSchema(p);

// //         // 2. Skip profiles missing mandatory 'ca' timestamp to avoid SQLite NOT NULL error
// //         if (item.ca === null) {
// //           console.log(
// //             " `[BulkSync] Skipping profile ${uid} due to missing 'ca' timestamp.`",
// //           );
// //           continue;
// //         }

// //         // 3. Update sync timestamp tracker
// //         if (updatedAt !== null && updatedAt > maxTimestamp) {
// //           maxTimestamp = updatedAt;
// //         }

// //         // 4. Push valid active items for upsert
// //         itemsToUpsert.push(item);
// //       }

// //       // 1. Delete inactive profiles from SQLite
// //       purgeInactiveBatchFromTx(tx, table, uidsToDelete);

// //       // 2. Upsert valid active profiles into SQLite
// //       if (itemsToUpsert.length > 0) {
// //         tx.insert(table)
// //           .values(itemsToUpsert)
// //           .onConflictDoUpdate({
// //             target: table.uid,
// //             set: {
// //               ca: sql`excluded.ca`,
// //               ua: sql`excluded.ua`,
// //               fn: sql`excluded.fn`,
// //               ln: sql`excluded.ln`,
// //               db: sql`excluded.db`,
// //               ht: sql`excluded.ht`,
// //               np: sql`excluded.np`,
// //               ai: sql`excluded.ai`,
// //               ms: sql`excluded.ms`,
// //               ir: sql`excluded.ir`,
// //               profileData: sql`excluded.profile_data`,
// //             },
// //           })
// //           .run();
// //       }
// //     }
// //   });

// //   const now = Date.now();
// //   await new Promise((resolve) => setTimeout(resolve, 50));
// //   appStorage.set(`is_initial_sync_done_${targetCollection}`, true);
// //   appStorage.set("last_synced_at", maxTimestamp || now);
// //   appStorage.set(`last_delta_run_${targetCollection}`, now);
// //   return rawProfiles.length;
// // };
// /**
