import { db } from "@/db/client";
import { parseProfileRow } from "@/db/utils/parseProfile";
import {
  asc,
  desc,
  gt,
  lte,
  lt,
  and,
  gte,
  eq,
  like,
  or,
  inArray,
} from "drizzle-orm";
import { Profile } from "@/features/profile/types/profile";
import { UserTier } from "@/context/types/auth.types";
import { appStorage, TIER_CACHE_KEY } from "@/cacheMMKV/cacheConfig";
import { freeUserFeeds, paidUserFeeds } from "@/db/schema/sqlprofiles";
import { BlocksCache } from "@/features/block/cache/blockCache";
import { LikesCache } from "@/features/likes/cache/likesCache";

//For limiting swipe deck memory
export const MAX_MEMORY_LIMIT = 50;
//...default
export const PAST_BATCH_SIZE = 5;
export const FUTURE_BATCH_SIZE = 15;
export const FETCH_PAGE_SIZE_DEFAULT = 15;
//...
export const FETCH_PAGE_SIZE_LATEST = 15;
//..
export const FETCH_PAGE_SIZE_SEARCH = 15;
//...
export const FETCH_PAGE_SIZE_FILTER = 15;

export interface InitialFeedResult {
  profiles: Profile[];
  initialIndex: number;
}
export type FeedTable = typeof freeUserFeeds | typeof paidUserFeeds;

/**
 * Resolves active feed table based on user tier in storage.
 */
export const resolveFeedTable = (overrideIsFree?: boolean): FeedTable => {
  if (typeof overrideIsFree === "boolean") {
    return overrideIsFree ? freeUserFeeds : paidUserFeeds;
  }

  const cachedTier = appStorage.getString(TIER_CACHE_KEY) as
    | UserTier
    | undefined;
  const isPaid = cachedTier === "basic" || cachedTier === "premium";

  return isPaid ? freeUserFeeds : freeUserFeeds;
};
/**
 * Reusable ingestion filter: Excludes blocked users and annotates liked status
 * synchronously using local MMKV cache at fetch time.
 */
export const processFeedProfiles = (profiles: Profile[]): Profile[] => {
  if (!profiles || profiles.length === 0) return [];

  const blockedSet = new Set(BlocksCache.getMergedIds());
  const likedSet = new Set(LikesCache.getIds());

  const inactiveUids: string[] = [];
  const validProfiles: Profile[] = [];

  // Single pass through the profiles array
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    if (!p?.uid) continue;

    if (p.ia === false) {
      inactiveUids.push(p.uid);
    } else if (!blockedSet.has(p.uid)) {
      validProfiles.push({
        ...p,
        liked: likedSet.has(p.uid),
      });
    }
  }

  // Trigger background purge if any inactive profiles were found
  if (inactiveUids.length > 0) {
    purgeInactiveProfilesFromDb(inactiveUids);
  }

  return validProfiles;
};

export const feedRepository = {
  /**
   * Fetches past + future profiles anchored at lastCa.
   */
  async getInitialFeed(
    lastCa?: string | Date | number | null,
    pastLimit: number = PAST_BATCH_SIZE,
    futureLimit: number = FUTURE_BATCH_SIZE,
    overrideIsFree?: boolean,
  ): Promise<InitialFeedResult> {
    const table = resolveFeedTable(overrideIsFree);

    try {
      const normalizedCa =
        lastCa instanceof Date
          ? lastCa.getTime()
          : typeof lastCa === "string"
            ? isNaN(Number(lastCa))
              ? new Date(lastCa).getTime()
              : Number(lastCa)
            : lastCa;

      // 1. Cold Start: No previous lastCa
      if (!normalizedCa || normalizedCa === 0) {
        const rows = db
          .select()
          .from(table)
          .orderBy(asc(table.ca))
          .limit(futureLimit)
          .all();

        const profiles = processFeedProfiles(rows.map(parseProfileRow));

        return { profiles, initialIndex: 0 };
      }

      // 2. Returning User: Fetch past profiles (<= lastCa)
      const pastRows = db
        .select()
        .from(table)
        .where(lt(table.ca, normalizedCa))
        .orderBy(desc(table.ca))
        .limit(pastLimit)
        .all();

      // Reverse past rows so they are chronological (earliest -> latest)
      const pastProfiles = processFeedProfiles(
        pastRows.map(parseProfileRow).reverse(),
      );

      // 3. Returning User: Fetch future profiles (> lastCa)
      const futureRows = db
        .select()
        .from(table)
        .where(gte(table.ca, normalizedCa))
        .orderBy(asc(table.ca))
        .limit(futureLimit)
        .all();

      const futureProfiles = processFeedProfiles(
        futureRows.map(parseProfileRow),
      );

      const combinedProfiles = [...pastProfiles, ...futureProfiles];

      const initialIndex = pastProfiles?.length > 0 ? pastProfiles.length : 0;

      return { profiles: combinedProfiles, initialIndex };
    } catch (error) {
      console.error("[feedRepository] Error loading initial feed:", error);
      throw error;
    }
  },

  /**
   * Subsequent pagination: Fetches next future batch.
   */
  async getNextFeedPage(
    lastCa?: string | Date | number | null,
    limit: number = FUTURE_BATCH_SIZE,
    overrideIsFree?: boolean,
  ): Promise<Profile[]> {
    try {
      if (!lastCa) return [];
      const table = resolveFeedTable(overrideIsFree);

      const normalizedCa =
        lastCa instanceof Date
          ? lastCa.getTime()
          : typeof lastCa === "string"
            ? isNaN(Number(lastCa))
              ? new Date(lastCa).getTime()
              : Number(lastCa)
            : lastCa;

      const rows = db
        .select()
        .from(table)
        .where(gt(table.ca, normalizedCa))
        .orderBy(asc(table.ca))
        .limit(limit)
        .all();

      return processFeedProfiles(rows.map(parseProfileRow));
    } catch (error) {
      console.error("[feedRepository] Error fetching next feed page:", error);
      throw error;
    }
  },

  /**
   * Fetch initial batch of profiles ordered by updated_at (ua) descending
   */
  getLatestProfiles: (limit: number = 50, overrideIsFree?: boolean) => {
    const table = resolveFeedTable(overrideIsFree);
    const rows = db
      .select()
      .from(table)
      .orderBy(desc(table.ua))
      .limit(limit)
      .all();

    return processFeedProfiles(rows.map(parseProfileRow));
  },

  /**
   * Fetch next batch of older profiles where ua < lastUa
   */
  getMoreLatestProfiles: (
    lastUa: number,
    limit: number = 50,
    overrideIsFree?: boolean,
  ) => {
    const table = resolveFeedTable(overrideIsFree);
    const rows = db
      .select()
      .from(table)
      .where(lt(table.ua, lastUa))
      .orderBy(desc(table.ua))
      .limit(limit)
      .all();

    return processFeedProfiles(rows.map(parseProfileRow));
  },

  /**
   * Helper to build condition array from filter object
   */
  buildFilterConditions: (filters: any) => {
    const conditions: any[] = [];
    if (!filters) return conditions;
    const table = resolveFeedTable();

    if (filters.maxAge) {
      const ageInt = parseInt(filters.maxAge, 10);
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - ageInt);
      conditions.push(gte(table.db, cutoffDate.getTime()));
    }

    if (filters.maxHeight) {
      conditions.push(lte(table.ht, Number(filters.maxHeight)));
    }

    if (filters.nativePlace) {
      conditions.push(eq(table.np, filters.nativePlace));
    }

    if (filters.minIncome) {
      conditions.push(gte(table.ai, Number(filters.minIncome)));
    }

    if (filters.maritalStatus !== undefined && filters.maritalStatus !== "") {
      conditions.push(eq(table.ms, Number(filters.maritalStatus)));
    }

    return conditions;
  },

  /**
   * Fetch filtered profiles with offset pagination
   */
  getFilteredProfiles: (
    filters: any,
    limit: number = 50,
    offset: number = 0,
    overrideIsFree?: boolean,
  ) => {
    const table = resolveFeedTable(overrideIsFree);
    const conditions = feedRepository.buildFilterConditions(filters);

    const rows = db
      .select()
      .from(table)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .all();

    return processFeedProfiles(rows.map(parseProfileRow));
  },

  /**
   * Search profiles by first or last name with offset pagination
   */
  searchProfiles: (
    query: string,
    limit: number = 20,
    offset: number = 0,
    overrideIsFree?: boolean,
  ) => {
    const cleanQuery = query?.trim();
    if (!cleanQuery) return [];

    const table = resolveFeedTable(overrideIsFree);
    const searchPattern = `${cleanQuery}%`;

    const rows = db
      .select()
      .from(table)
      .where(or(like(table.fn, searchPattern), like(table.ln, searchPattern)))
      .limit(limit)
      .offset(offset)
      .all();

    return processFeedProfiles(rows.map(parseProfileRow));
  },
};

/**
 * Background deletion task for inactive SQLite profile rows
 */
const purgeInactiveProfilesFromDb = async (
  uids: string[],
  overrideIsFree?: boolean,
): Promise<void> => {
  if (!uids || uids.length === 0) return;
  const table = resolveFeedTable(overrideIsFree);
  try {
    await db.delete(table).where(inArray(table.uid, uids));
  } catch (err) {
    console.error("[FeedSync] Failed to purge inactive profiles from DB:", err);
  }
};
