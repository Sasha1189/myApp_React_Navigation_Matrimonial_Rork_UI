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
          return true;
        }

        const freeQuery = queryFs(
          collection(firestore, targetCollection),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        // Fetch the documents directly from the active Firestore server
        const snapshot = await getDocsFromServer(freeQuery);

        if (snapshot && snapshot.size > 0) {
          storage.set(SYNC_KEY, 1);
          return true;
        } else {
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
      }

      // 2. Full/Delta Sync
      const q = queryFs(
        collection(firestore, targetCollection),
        where("updatedAt", ">", new Date(lastSync)),
      );

      const snapshot = await getDocsFromServer(q);

      if (!snapshot.metadata.fromCache) {
        storage.set(SYNC_KEY, Date.now());
      }

      return true;
    } catch (error) {
      console.error("❌ Sync Error:", error);
      return false;
    }
  },
};
