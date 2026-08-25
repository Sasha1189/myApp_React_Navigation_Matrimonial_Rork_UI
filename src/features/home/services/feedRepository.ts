import { db } from "@/db/client";
import { sqlProfileTable } from "@/db/schema/sqlprofiles";
import { parseProfileRow } from "@/utils/parseProfile";
import {
  asc,
  desc,
  gt,
  lte,
  count,
  lt,
  and,
  gte,
  eq,
  like,
  or,
} from "drizzle-orm";
import { Profile } from "@/features/profile/types/profile";

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

export const feedRepository = {
  /**
   * Fetches past + future profiles anchored at lastCa.
   */
  async getInitialFeed(
    lastCa?: string | Date | number | null,
    pastLimit: number = PAST_BATCH_SIZE,
    futureLimit: number = FUTURE_BATCH_SIZE,
  ): Promise<InitialFeedResult> {
    try {
      // 1. Fetch Total Database Count
      const [countResult] = db
        .select({ total: count() })
        .from(sqlProfileTable)
        .all();

      const totalDbLength = countResult?.total ?? 0;
      console.log(`[feedRepository] Total Profiles in DB: ${totalDbLength}`);

      // --------------------------------
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
        console.log(
          `[feedRepository] Cold start: Fetching initial ${futureLimit} profiles...`,
        );
        const rows = db
          .select()
          .from(sqlProfileTable)
          .orderBy(asc(sqlProfileTable.ca))
          .limit(futureLimit)
          .all();

        const profiles = rows.map(parseProfileRow);
        console.log(
          `[feedRepository] Cold start loaded ${profiles.length} profiles.`,
        );

        return { profiles, initialIndex: 0 };
      }

      // 2. Returning User: Fetch past profiles (<= lastCa)
      console.log(
        `[feedRepository] Fetching ${pastLimit} past profiles (ca < ${normalizedCa})...`,
      );
      const pastRows = db
        .select()
        .from(sqlProfileTable)
        .where(lt(sqlProfileTable.ca, normalizedCa))
        .orderBy(desc(sqlProfileTable.ca))
        .limit(pastLimit)
        .all();

      // Reverse past rows so they are chronological (earliest -> latest)
      const pastProfiles = pastRows.map(parseProfileRow).reverse();

      // 3. Returning User: Fetch future profiles (> lastCa)
      console.log(
        `[feedRepository] Fetching ${futureLimit} future profiles (ca >= ${normalizedCa})...`,
      );
      const futureRows = db
        .select()
        .from(sqlProfileTable)
        .where(gte(sqlProfileTable.ca, normalizedCa))
        .orderBy(asc(sqlProfileTable.ca))
        .limit(futureLimit)
        .all();

      const futureProfiles = futureRows.map(parseProfileRow);

      const combinedProfiles = [...pastProfiles, ...futureProfiles];

      const initialIndex = pastProfiles?.length > 0 ? pastProfiles.length : 0;

      console.log(
        `[feedRepository] Feed Initialized:\n` +
          `  - Past Profiles Loaded: ${pastProfiles.length}\n` +
          `  - Future Profiles Loaded: ${futureProfiles.length}\n` +
          `  - Target Initial Index: ${initialIndex}\n` +
          combinedProfiles
            .map(
              (p, i) =>
                `  [Index ${i}${i === initialIndex ? " *ACTIVE*" : ""}] UID: ${p.uid} | ca: ${p.ca}`,
            )
            .join("\n"),
      );

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
  ): Promise<Profile[]> {
    try {
      if (!lastCa) return [];

      const normalizedCa =
        lastCa instanceof Date
          ? lastCa.getTime()
          : typeof lastCa === "string"
            ? isNaN(Number(lastCa))
              ? new Date(lastCa).getTime()
              : Number(lastCa)
            : lastCa;

      console.log(
        `[feedRepository] Fetching next batch (ca > ${normalizedCa}, limit: ${limit})...`,
      );

      const rows = db
        .select()
        .from(sqlProfileTable)
        .where(gt(sqlProfileTable.ca, normalizedCa))
        .orderBy(asc(sqlProfileTable.ca))
        .limit(limit)
        .all();

      const nextProfiles = rows.map(parseProfileRow);
      console.log(
        `[feedRepository] Appending ${nextProfiles.length} new profiles.`,
      );

      return nextProfiles;
    } catch (error) {
      console.error("[feedRepository] Error fetching next feed page:", error);
      throw error;
    }
  },

  /**
   * Fetch initial batch of profiles ordered by updated_at (ua) descending
   */
  getLatestProfiles: (limit: number = 50) => {
    console.log(`[feedRepository] Fetching latest ${limit} profiles...`);
    const rows = db
      .select()
      .from(sqlProfileTable)
      .orderBy(desc(sqlProfileTable.ua))
      .limit(limit)
      .all();

    return rows.map(parseProfileRow);
  },

  /**
   * Fetch next batch of older profiles where ua < lastUa
   */
  getMoreLatestProfiles: (lastUa: number, limit: number = 50) => {
    console.log(
      `[feedRepository] Fetching next ${limit} profiles (ua < ${lastUa})...`,
    );
    const rows = db
      .select()
      .from(sqlProfileTable)
      .where(lt(sqlProfileTable.ua, lastUa))
      .orderBy(desc(sqlProfileTable.ua))
      .limit(limit)
      .all();

    return rows.map(parseProfileRow);
  },

  /**
   * Helper to build condition array from filter object
   */
  buildFilterConditions: (filters: any) => {
    const conditions: any[] = [];
    if (!filters) return conditions;

    if (filters.maxAge) {
      const ageInt = parseInt(filters.maxAge, 10);
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - ageInt);
      conditions.push(gte(sqlProfileTable.db, cutoffDate.getTime()));
    }

    if (filters.maxHeight) {
      conditions.push(lte(sqlProfileTable.ht, Number(filters.maxHeight)));
    }

    if (filters.nativePlace) {
      conditions.push(eq(sqlProfileTable.np, filters.nativePlace));
    }

    if (filters.minIncome) {
      conditions.push(gte(sqlProfileTable.ai, Number(filters.minIncome)));
    }

    if (filters.maritalStatus !== undefined && filters.maritalStatus !== "") {
      conditions.push(eq(sqlProfileTable.ms, Number(filters.maritalStatus)));
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
  ) => {
    console.log(
      `[feedRepository] Fetching filtered profiles (limit: ${limit}, offset: ${offset})...`,
    );

    const conditions = feedRepository.buildFilterConditions(filters);

    const rows = db
      .select()
      .from(sqlProfileTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .all();

    return rows.map(parseProfileRow);
  },

  /**
   * Search profiles by first or last name with offset pagination
   */
  searchProfiles: (query: string, limit: number = 20, offset: number = 0) => {
    const cleanQuery = query?.trim();
    if (!cleanQuery) return [];

    console.log(
      `[feedRepository] Searching profiles for "${cleanQuery}" (limit: ${limit}, offset: ${offset})...`,
    );
    const searchPattern = `${cleanQuery}%`;

    const rows = db
      .select()
      .from(sqlProfileTable)
      .where(
        or(
          like(sqlProfileTable.fn, searchPattern),
          like(sqlProfileTable.ln, searchPattern),
        ),
      )
      .limit(limit)
      .offset(offset)
      .all();

    return rows.map(parseProfileRow);
  },
};
