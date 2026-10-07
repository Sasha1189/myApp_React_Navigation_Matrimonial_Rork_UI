import { api } from "@/services/api";
import { Profile } from "../types/profile";

export type ProfileCollection = "maleProfiles" | "femaleProfiles";

/**
 * Helper to get collection name on the client side
 */
export const getProfileCollection = (gender: string): ProfileCollection => {
  const normalized = gender.toLowerCase().trim();
  if (normalized === "male") return "maleProfiles";
  if (normalized === "female") return "femaleProfiles";
  throw new Error(`Invalid gender '${gender}'. Must be 'male' or 'female'.`);
};

export interface CreateProfilePayload extends Partial<Profile> {
  uid: string;
  collectionName: ProfileCollection;
}

export interface CreateProfileParams {
  uid: string;
  gender: string;
  [key: string]: any; // Allows the rest of the profile properties
}

export interface UpdateProfilePayload extends Partial<Profile> {
  uid: string;
  collectionName: ProfileCollection;
}

/**
 * GET Profile by collectionName and uid
 */
export async function getProfile(
  uid: string,
  gender: string,
): Promise<Profile> {
  if (!uid || !gender)
    return Promise.reject(
      new Error("Missing uid or gender for profile retrieval."),
    );

  try {
    const collectionName = getProfileCollection(gender);
    const res = await api.get<{ message: string; profile: Profile }>(
      `/profile/profile/${collectionName}/${uid}`,
    );
    const profile = res.profile ?? res;
    return profile as Profile;
  } catch (error) {
    console.error("❌ [GET_PROFILE_CLIENT_ERROR]:", error);
    throw error;
  }
}

/**
 * CREATE Profile with explicit collectionName
 */
export async function createProfile(
  payload: CreateProfileParams,
): Promise<Profile> {
  try {
    const { gender, ...data } = payload;
    const collectionName = getProfileCollection(gender);

    console.log("✅ [CREATE_PROFILE_PAYLOAD]:", {
      ...data,
      gender,
      collectionName,
    });

    const res = await api.post<{ message: string; profile: Profile }>(
      `/profile/profile/create`,
      {
        ...data,
        gender,
        collectionName,
      },
    );

    return res.profile;
  } catch (error) {
    console.error("❌ [CREATE_PROFILE_CLIENT_ERROR]:", error);
    throw error;
  }
}

/**
 * UPDATE Profile with explicit collectionName
 */
export async function updateProfile(
  payload: Omit<UpdateProfilePayload, "collectionName"> & { gender: string },
): Promise<void> {
  try {
    const { gender, ...data } = payload;
    const collectionName = getProfileCollection(gender);

    console.log("✅ [UPDATE_PROFILE_PAYLOAD]:", {
      ...data,
      gender,
      collectionName,
    });

    await api.put(`/profile/update`, {
      ...data,
      gender,
      collectionName,
    });
  } catch (error) {
    console.error("❌ [UPDATE_PROFILE_CLIENT_ERROR]:", error);
    throw error;
  }
}
