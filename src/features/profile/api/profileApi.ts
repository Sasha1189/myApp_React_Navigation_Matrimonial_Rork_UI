import { firestore, doc, setDoc, getDoc } from "../../../config/firebase";
import { Profile } from "../types/profile";

// Helper to sanitize and get collection name
const getProfileCollection = (gender: string): string => {
  return `${gender.toLowerCase().trim()}Profiles`;
};

export async function getProfile(
  uid: string,
  gender: string,
): Promise<Profile | undefined> {
  if (!uid || !gender || typeof gender !== "string") return undefined;

  const collectionName = getProfileCollection(gender);
  const docRef = doc(firestore, collectionName, uid);

  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Profile) : undefined;
  } catch (error) {
    console.error("Error getting self profile:", error);
    return undefined;
  }
}
/**
 * Updates or creates a user profile using pure Unix millisecond timestamps (`Date.now()`).
 */
export async function apiUpdateProfile(
  payload: Partial<Profile> & { uid: string; gender: string },
): Promise<Profile> {
  const { uid, gender, ...data } = payload;

  if (!uid || !gender) {
    throw new Error("Missing required uid or gender for profile update.");
  }

  const collectionName = getProfileCollection(gender);
  const docRef = doc(firestore, collectionName, uid);
  const now = Date.now();

  let createdAt = data.ca;

  if (!createdAt) {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      createdAt = (docSnap.data() as Profile).ca;
    }
  }

  const updatedProfile: Profile = {
    ...(data as Profile),
    uid,
    gender,
    ca: createdAt || now,
    ua: now,
  };

  await setDoc(docRef, updatedProfile, { merge: true });

  return updatedProfile;
}
