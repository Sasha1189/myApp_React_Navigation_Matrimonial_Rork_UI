import { firestore, doc, getDoc } from "@/config/firebase";
import { VerificationStatus } from "@/context";

export const checkUserVerification = async (
  uid: string,
): Promise<VerificationStatus | null> => {
  try {
    const userDocRef = doc(firestore, "users", uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      return data?.isVerified || null;
    }
    return null;
  } catch (error) {
    console.error(
      "❌ Error fetching user verification status from Firestore:",
      error,
    );
    throw error;
  }
};
