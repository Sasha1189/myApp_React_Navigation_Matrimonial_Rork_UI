import { firestore, doc, setDoc, getDoc } from "../../../config/firebase";
import { Profile } from "../../../types/profile";

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
  payload: Partial<Profile> & { uid: string; gender: string },
): Promise<Profile> {
  const { uid, gender, ...data } = payload;

  const collectionName = `${gender.toLowerCase()}Profiles`;

  const docRef = doc(firestore, collectionName, uid);

  await setDoc(
    docRef,
    {
      ...data,
      uid,
      gender,
      updatedAt: new Date(),
    },
    { merge: true },
  );

  // Fetch the latest version back (from cache)
  const snap = await getDoc(docRef);
  return snap.data() as Profile;
}
