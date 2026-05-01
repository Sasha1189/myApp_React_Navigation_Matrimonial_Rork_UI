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
  syncFeeds: async (gender: string) => {
    // 1. Check if it exists at all
    if (!gender) return false;

    // 2. Check if it is actually a string before touching it
    if (typeof gender !== "string") return false;

    const normalizedGender = gender.toLowerCase();
    if (normalizedGender !== "male" && normalizedGender !== "female")
      return false;

    const targetCollection =
      normalizedGender === "male" ? "femaleProfiles" : "maleProfiles";

    try {
      const lastSync = storage.getNumber(SYNC_KEY) || 0;
      // 1. If new user, get the first batch fast
      if (lastSync === 0) {
        const firstBatch = await getDocsFromServer(
          queryFs(
            collection(firestore, targetCollection),
            orderBy("createdAt", "asc"),
            limit(2),
          ),
        );
        storage.set(SYNC_KEY, 1);
        console.log(`✅ Initial ${firstBatch.size} profiles injected.`);
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
