import { updateProfile } from "@/features/profile/api/profileApi";

/**
 * Deactivates user profile by delegating to updateProfile (sets ia: false)
 */
export const deactivateUserProfile = async (
  uid: string,
  gender: string,
): Promise<void> => {
  const normalizedGender = gender.toLowerCase();
  if (!uid || (normalizedGender !== "male" && normalizedGender !== "female")) {
    return;
  }

  try {
    await updateProfile({
      uid,
      gender: normalizedGender,
      ia: false, // Update just the active status flag
    });
  } catch (error) {
    console.error(
      `[profileService] Failed to set ia: false for ${uid}:`,
      error,
    );
  }
};
