import {
  firestore,
  getDocsFromServer,
  collection,
  queryFs,
  where,
  orderBy,
  limit,
} from "@/config/firebase";
import { storage } from "../../../cache/cacheConfig";

const SYNC_KEY = "profiles_last_sync_timestamp";

export const FeedSyncService = {
  syncFeeds: async (gender: string, tier: string = "none") => {
    // 1. Check if it exists at all
    if (!gender) return false;

    // 2. Check if it is actually a string before touching it
    if (typeof gender !== "string") return false;

    const normalizedGender = gender.toLowerCase();
    if (normalizedGender !== "male" && normalizedGender !== "female")
      return false;

    const targetCollection =
      normalizedGender === "male" ? "femaleProfiles" : "maleProfiles";
    const userTier = tier?.toLowerCase().trim() || "none";

    try {
      const lastSync = storage.getNumber(SYNC_KEY) || 0;

      // --- 1. FAIL-SAFE FREE TRIAL USER BLOCK ---
      if (userTier === "none") {
        if (lastSync > 0) {
          console.log(
            "🛑 Free user already has 5 profiles stored. Server request BLOCKED.",
          );
          return true;
        }

        console.log(
          "⚠️ Fresh free user session. Attempting to download 5 profiles from the server.",
        );

        const freeQuery = queryFs(
          collection(firestore, targetCollection),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        // Fetch the documents directly from the active Firestore server
        const snapshot = await getDocsFromServer(freeQuery);

        if (snapshot && snapshot.size > 0) {
          storage.set(SYNC_KEY, 1);
          console.log(
            `✅ Success: Downloaded ${snapshot.size} profiles. Sync token LOCKED to 1.`,
          );
          return true;
        } else {
          // If the server returned 0 profiles or failed silently, do NOT lock the token
          console.log(
            "⚠️ Server returned an empty batch. Leaving sync token at 0 to retry later.",
          );
          return false;
        }
      }

      // 1. If new user, get the first batch fast
      if (lastSync === 0 || lastSync === 1) {
        const firstBatch = await getDocsFromServer(
          queryFs(
            collection(firestore, targetCollection),
            orderBy("createdAt", "asc"),
            limit(2),
          ),
        );
        storage.set(SYNC_KEY, Date.now());
        console.log(`✅ Initial paid ${firstBatch.size} profiles injected.`);
      }

      // 2. Full/Delta Sync
      const q = queryFs(
        collection(firestore, targetCollection),
        where("updatedAt", ">", new Date(lastSync)),
      );

      const snapshot = await getDocsFromServer(q);

      if (!snapshot.metadata.fromCache) {
        storage.set(SYNC_KEY, Date.now());
        console.log(`✅ Phase 2: Full sync complete (+${snapshot.size}).`);
      }

      return true;
    } catch (error) {
      console.error("❌ Sync Error:", error);
      return false;
    }
  },
};
