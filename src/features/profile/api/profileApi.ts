import {
  firestore,
  doc,
  setDoc,
  getDoc,
  firestoreServerTimestamp,
} from "../../../config/firebase";
import { Profile } from "../types/profile";

export async function getProfile(
  uid: string,
  gender: string,
): Promise<Profile | undefined> {
  if (!gender) return;

  if (typeof gender !== "string") return;

  const collectionName = `${gender.toLowerCase()}Profiles`;
  const docRef = doc(firestore, collectionName, uid);

  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Profile) : undefined;
  } catch (error) {
    console.error("Error getting self profile:", error);
    return undefined;
  }
}

export async function apiUpdateProfile(
  payload: any & { uid: string; gender: string },
): Promise<Profile> {
  const { uid, gender, ...data } = payload;

  const collectionName = `${gender.toLowerCase()}Profiles`;

  const docRef = doc(firestore, collectionName, uid);

  const docSnap = await getDoc(docRef);
  const existingData = docSnap.exists() ? docSnap.data() : null;
  const svts = firestoreServerTimestamp();

  await setDoc(
    docRef,
    {
      ...data,
      uid,
      gender,
      createdAt: existingData?.createdAt || svts,
      updatedAt: svts,
    },
    { merge: true },
  );

  // Fetch the latest version back (for cache)
  const snap = await getDoc(docRef);
  return snap.data() as Profile;
}
