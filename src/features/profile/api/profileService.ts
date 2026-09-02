import { doc, getDoc, firestore } from "@/config/firebase";
import { Profile } from "../types/profile";

export const getProfile = async (
  uid: string,
  gender: string,
): Promise<Profile | null> => {
  const collectionName =
    gender.toLowerCase().trim() === "male" ? "maleProfiles" : "femaleProfiles";
  const docRef = doc(firestore, collectionName, uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data() as Profile;
  }
  return null;
};
