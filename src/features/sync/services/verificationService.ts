import { getUser } from "@/features/auth/api/userApi";
import { VerificationStatus } from "@/context";

export const checkUserVerification = async (
  uid: string,
): Promise<VerificationStatus | null> => {
  try {
    const userData = await getUser(uid);
    return userData?.verified ?? null;
  } catch (error) {
    throw error;
  }
};
