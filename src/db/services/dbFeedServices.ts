import { db } from "@/db/client";
import { parseProfileRow } from "@/db/utils/parseProfile";
import { eq, inArray } from "drizzle-orm";
import { Profile } from "@/features/profile/types/profile";
import { resolveFeedTable } from "@/features/home/services/feedRepository"; // Adjust path to your helper

export const feedRepository = {
  async fetchProfileByUid(
    uid: string,
    overrideIsFree?: boolean,
  ): Promise<Profile | null> {
    if (!uid) return null;

    try {
      // 1. Resolve table based on tier/override
      const primaryTable = resolveFeedTable(overrideIsFree);

      let [row] = await db
        .select()
        .from(primaryTable)
        .where(eq(primaryTable.uid, uid))
        .limit(1);
      return row ? parseProfileRow(row) : null;
    } catch (error) {
      console.error(
        `[fetchProfileByUid] Failed to load profile for uid:`,
        error,
      );
      return null;
    }
  },

  /**
   * Hydrates profiles from local SQLite matching the provided UIDs.
   * Preserves the exact array order passed in (e.g. chronological sorting).
   */
  async fetchProfilesByUids(
    uids: string[],
    overrideIsFree?: boolean,
  ): Promise<Profile[]> {
    if (!uids || uids.length === 0) return [];
    const table = resolveFeedTable(overrideIsFree);

    try {
      const results = await db
        .select()
        .from(table)
        .where(inArray(table.uid, uids));

      const Profiles = results.map(parseProfileRow);

      const profileMap = new Map(Profiles.map((p) => [p.uid, p as Profile]));
      return uids
        .map((uid) => profileMap.get(uid))
        .filter((p): p is Profile => Boolean(p));
    } catch (error) {
      console.error("[profileService] Failed to load profiles by UIDs:", error);
      return [];
    }
  },
};
