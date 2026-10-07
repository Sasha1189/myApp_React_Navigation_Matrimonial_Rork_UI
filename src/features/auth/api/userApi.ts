import { api } from "@/services/api";
import { VerificationStatus, genderType, UserTier } from "@/context";

/**
 * Interface for creating a new user
 */
export interface CreateUserPayload {
  uid: string;
  fullName: string;
  mobileNumber: string;
  gender: "male" | "female" | "";
  email?: string;
}

/**
 * Interface for flexible updates (accepts any key-value pairs)
 */
export interface UpdateUserPayload {
  [key: string]: any;
}

/**
 * Interface for user response
 */
export interface UserResponse {
  uid: string;
  fullName: string;
  mobileNumber?: string;
  gender?: genderType;
  tier?: UserTier;
  verified?: VerificationStatus;
  [key: string]: any; // Allows accessing dynamic fields from response
}

/**
 * Create user profile via backend API
 */
export async function createUser(payload: CreateUserPayload) {
  try {
    const res = await api.post(`/user/create-user`, payload);
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile with any key-value pairs
 */
export async function updateUser(payload: UpdateUserPayload) {
  try {
    const res = await api.post(`/user/update-user`, payload);
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches user profile data from backend API
 */
export const getUser = async (uid: string): Promise<UserResponse | null> => {
  try {
    const userData = await api.get<UserResponse>(`/user/${uid}`);
    return userData ?? null;
  } catch (error: any) {
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
};
