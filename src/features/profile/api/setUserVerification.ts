import {
  firestore,
  firestoreServerTimestamp,
  doc,
  setDoc,
} from "@/config/firebase";

export const setUserVerification = async (uid: string): Promise<void> => {
  const userDocRef = doc(firestore, "users", uid);
  const ts = firestoreServerTimestamp();

  await setDoc(
    userDocRef,
    {
      isVerified: "pending",
      updatedAt: ts,
    },
    { merge: true },
  );
};
