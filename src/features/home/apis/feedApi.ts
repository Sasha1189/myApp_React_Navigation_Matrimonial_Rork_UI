import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
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
const PROFILES_DATA_KEY = "cached_user_profiles";

// 1. Fully defined interface matching standard Firestore timestamp payloads
export interface Profile {
  uid: string;
  createdAt?: { seconds: number; nanoseconds: number } | any;
  updatedAt?: { seconds: number; nanoseconds: number } | any;
  [key: string]: any;
}

export const FeedSyncService = {
  /**
   * Helper to retrieve current cached profiles from MMKV safely
   */
  getCachedProfiles: (): Record<string, Profile> => {
    try {
      const rawData = storage.getString(PROFILES_DATA_KEY);
      return rawData ? JSON.parse(rawData) : {};
    } catch (error) {
      console.error("❌ MMKV Read Error:", error);
      return {};
    }
  },

  /**
   * Syncs profile feeds from Firestore server directly down to MMKV storage.
   * Fixed Syntax: Changed '=' to ':' for valid object method definition.
   */
  syncFeeds: async (
    gender: string | null | undefined,
    tier: string = "none",
  ): Promise<boolean> => {
    if (!gender || typeof gender !== "string") return false;

    const normalizedGender = gender.toLowerCase().trim();

    if (normalizedGender !== "male" && normalizedGender !== "female")
      return false;

    const targetCollection =
      normalizedGender === "male" ? "femaleProfiles" : "maleProfiles";

    const userTier = tier?.toLowerCase().trim() || "none";

    try {
      const lastSync = storage.getNumber(SYNC_KEY) || 0;
      let existingProfiles = FeedSyncService.getCachedProfiles();
      let hasNewData = false;

      const mergeSnapshots = (
        snapshot: FirebaseFirestoreTypes.QuerySnapshot,
      ) => {
        if (!snapshot || snapshot.empty) return;
        snapshot.forEach(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            if (doc && doc.id) {
              existingProfiles[doc.id] = {
                uid: doc.id,
                ...doc.data(),
              } as Profile;
              hasNewData = true;
            }
          },
        );
      };

      // --- 1. FREE TRIAL USER LIMITATION ---
      if (userTier === "none") {
        if (lastSync > 0) return true; // Free limits met, do not query network resource

        const freeQuery = queryFs(
          collection(firestore, targetCollection),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const snapshot = await getDocsFromServer(freeQuery);

        if (snapshot && !snapshot.empty) {
          mergeSnapshots(snapshot);
          storage.set(PROFILES_DATA_KEY, JSON.stringify(existingProfiles));
          storage.set(SYNC_KEY, 1); // Mark initialization completed
          return true;
        }
        return false;
      }

      // --- 2. PREMIUM USERS: INITIAL SEED SYNC ---
      if (lastSync === 0 || lastSync === 1) {
        const firstBatch = await getDocsFromServer(
          queryFs(
            collection(firestore, targetCollection),
            orderBy("createdAt", "asc"),
            limit(2),
          ),
        );
        mergeSnapshots(firstBatch);
      }

      // --- 3. PREMIUM USERS: DELTA SYNC ---
      // Guard Case: If lastSync is 1 (free user converted to premium), query from timestamp epoch 0
      const queryTimestamp = lastSync === 1 ? 0 : lastSync;
      const deltaQuery = queryFs(
        collection(firestore, targetCollection),
        where("updatedAt", ">", new Date(queryTimestamp)),
      );

      const snapshot = await getDocsFromServer(deltaQuery);
      mergeSnapshots(snapshot);

      // Commit changes to MMKV engine if new records landed or clean slate initialized
      if (hasNewData || lastSync === 0) {
        storage.set(PROFILES_DATA_KEY, JSON.stringify(existingProfiles));
        storage.set(SYNC_KEY, Date.now());
      }

      return true;
    } catch (error) {
      console.error("❌ Sync Error:", error);
      return false;
    }
  },
};
