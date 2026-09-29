import { firestore, doc, setDoc, getDoc } from "@/config/firebase";

export async function updateUserDeviceId(uid: string, activeDeviceId: string) {
  try {
    const collectionName = "users";

    const docRef = doc(firestore, collectionName, uid);
    await setDoc(
      docRef,
      {
        activeDeviceId,
        updatedAt: new Date(),
      },
      { merge: true },
    );
  } catch (error) {
    throw error;
  }
}

export async function getUserDeviceId(uid: string) {
  try {
    const collectionName = "users";
    const docRef = doc(firestore, collectionName, uid);
    const snap = await getDoc(docRef);
    return snap.data()?.activeDeviceId;
  } catch (error) {
    throw error;
  }
}
