import { updateUser, getUser } from "@/features/auth/api/userApi";

/**
 * Updates active device ID via backend API
 */
export async function updateUserDeviceId(
  uid: string,
  activeDeviceId: string,
): Promise<void> {
  try {
    await updateUser({ activeDeviceId });
  } catch (error) {
    throw error;
  }
}

/**
 * Gets user active device ID via backend API
 */
export async function getUserDeviceId(
  uid: string,
): Promise<string | undefined> {
  try {
    const userData = await getUser(uid);
    return userData?.activeDeviceId;
  } catch (error) {
    throw error;
  }
}
