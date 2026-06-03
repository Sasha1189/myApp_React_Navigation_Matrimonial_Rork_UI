import { storage } from "../../../cache/cacheConfig";
import { Profile } from "../../../types/profile";
import { apiUpdateProfile } from "../api/profileApi";
import { sanitizePayload } from "../../../utils/sanitizePayload";

const PROFILE_CACHE_KEY = "self_profile_cache";

export const useUpdateProfile = (
  user: any,
  myProfile: Profile,
  setMyProfile: (p: Profile) => void,
  tier: string,
) => {
  return async (newData: Partial<Profile>) => {
    const gender = myProfile?.gender || user?.displayName;

    if (!user?.uid || !gender) return;

    const isPaidUser = tier === "basic" || tier === "premium";

    // 1. Sanitize incoming section updates immediately
    const cleanNewData = sanitizePayload(newData);

    // 2. Build the updated profile blueprint for local memory
    const rawUpdatedProfile = {
      ...myProfile,
      ...cleanNewData,
      uid: user.uid,
      gender: gender,
    };

    // 3. Clean the local profile memory copy to strip out any existing blank keys
    const fullySanitizedProfile = sanitizePayload(rawUpdatedProfile) as Profile;

    try {
      // 4. Server-Write Path (Strictly limited to Paid users per business logic)
      if (isPaidUser) {
        // Paid tiers push only their sanitized changes to the cloud database
        if (Object.keys(cleanNewData).length > 0) {
          await apiUpdateProfile({
            uid: user.uid,
            gender: gender,
            ...cleanNewData,
          });
          console.log(
            "🚀 [Server Update]: Paid user changes committed to cloud safely.",
          );
        }
      } else {
        // Free user accounts bypass network operations entirely
        console.log(
          "🔒 [Local Sync Only]: Account is Free. Skipping cloud sync per business rules.",
        );
      }

      // 5. Sync Local State & MMKV Storage Cache cleanly
      setMyProfile(fullySanitizedProfile);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(fullySanitizedProfile));
      console.log(
        "✅ [Local Cache Updated]: Cleaned profile data written back to MMKV storage cache.",
      );
    } catch (error) {
      console.error("❌ Update failed:", error);
      throw error;
    }
  };
};

// import { storage } from "../../../cache/cacheConfig";
// import { Profile } from "../../../types/profile";
// import { apiUpdateProfile } from "../api/profileApi";

// const PROFILE_CACHE_KEY = "self_profile_cache";

// export const useUpdateProfile = (
//   user: any,
//   myProfile: Profile,
//   setMyProfile: (p: Profile) => void,
//   tier: string,
// ) => {
//   return async (newData: Partial<Profile>) => {
//     const gender = myProfile?.gender || user?.displayName;

//     if (!user?.uid || !gender) return;

//     const isPaidUser = tier === "basic" || tier === "premium";
//     const updatedProfile: Profile = {
//       ...myProfile,
//       ...newData,
//       uid: user.uid,
//     };

//     try {
//       if (isPaidUser) {
//         await apiUpdateProfile({
//           uid: user.uid,
//           gender: gender,
//           ...newData,
//         });
//       }
//       // 2. Sync Local State & MMKV
//       setMyProfile(updatedProfile);
//       storage.set(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
//     } catch (error) {
//       console.error("❌ Update failed:", error);
//       throw error;
//     }
//   };
// };
