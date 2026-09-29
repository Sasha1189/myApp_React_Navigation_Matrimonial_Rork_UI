import { doc, getDoc, updateDoc, firestore } from "@/config/firebase";

export const deactivateUserProfile = async (
  uid: string,
  gender?: string,
): Promise<void> => {
  if (!uid || !gender) return;

  const collectionName = `${gender.toLowerCase()}Profiles`;
  const docRef = doc(firestore, collectionName, uid);

  try {
    const snap = await getDoc(docRef);

    // 🛑 If profile doesn't exist or is ALREADY inactive, abort to save writes
    if (!snap.exists() || snap.data()?.ia === false) {
      return;
    }

    await updateDoc(docRef, { ia: false });
  } catch (error) {
    console.error(
      `[profileService] Failed to set ia: false for ${uid}:`,
      error,
    );
  }
};
