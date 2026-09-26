import {
  firestore,
  firestoreServerTimestamp,
  doc,
  getDoc,
  setDoc,
} from "@/config/firebase";

export interface UserPayload {
  fullName: string;
  mobileNumber: string;
  gender: "male" | "female" | "";
}

export const saveUser = async (
  uid: string,
  data: UserPayload,
): Promise<void> => {
  const userDocRef = doc(firestore, "users", uid);
  const ts = firestoreServerTimestamp();

  await setDoc(
    userDocRef,
    {
      uid,
      phoneNumber: data.mobileNumber,
      fullName: data.fullName,
      gender: data.gender,
      updatedAt: ts,
      createdAt: ts,
    },
    { merge: true },
  );
};

export const getUser = async (uid: string): Promise<any | null> => {
  const docRef = doc(firestore, "users", uid);

  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data() as any;
  }
  return null;
};
