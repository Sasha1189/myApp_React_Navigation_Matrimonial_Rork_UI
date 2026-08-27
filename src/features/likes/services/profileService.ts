import { db } from "@/db/client";
import { sqlProfileTable } from "@/db/schema/sqlprofiles";
import { parseProfileRow } from "@/utils/parseProfile";
import { Profile } from "@/features/profile/types/profile";
import { inArray } from "drizzle-orm";

export const profileService = {
  /**
   * Hydrates profiles from local SQLite matching the provided UIDs.
   * Preserves the exact array order passed in (e.g. chronological sorting).
   */
  async fetchProfilesByUids(uids: string[]): Promise<Profile[]> {
    if (!uids || uids.length === 0) return [];

    try {
      const results = await db
        .select()
        .from(sqlProfileTable)
        .where(inArray(sqlProfileTable.uid, uids));

      const Profiles = results.map((row) =>
        parseProfileRow({
          ...row,
          profileData: JSON.stringify(row.profileData),
        }),
      );

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
