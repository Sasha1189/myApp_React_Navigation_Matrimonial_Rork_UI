import {
  firestore,
  writeBatch,
  doc,
  arrayUnion,
  arrayRemove,
} from "@/config/firebase";

export const blockUser = async (myProfile: any, targetProfile: any) => {
  const batch = writeBatch(firestore);

  // 1. Prepare Mini-Objects
  const targetData = {
    uid: targetProfile.uid,
    name: targetProfile.fullName || targetProfile.name,
    photo: targetProfile.thumbnail || targetProfile.photo || "",
  };

  const myData = {
    uid: myProfile.uid,
    name: myProfile.fullName || myProfile.name,
    photo: myProfile.thumbnail || myProfile.photo || "",
  };

  // 2. Add B's info to A's blocked list
  const myBlockRef = doc(firestore, "blockedIDs", myProfile.uid);
  batch.set(
    myBlockRef,
    {
      blockedUsers: arrayUnion(targetData),
    },
    { merge: true },
  );

  // 3. Add A's info to B's blocked list (Mutual Block)
  const targetBlockRef = doc(firestore, "blockedIDs", targetProfile.uid);
  batch.set(
    targetBlockRef,
    {
      blockedUsers: arrayUnion(myData),
    },
    { merge: true },
  );

  await batch.commit();
};

export const unblockUser = async (myUid: string, targetUid: string) => {
  const batch = writeBatch(firestore);

  // 1. Delete A's block of B
  const myBlockRef = doc(firestore, "blockedIDs", myUid);
  // Based on your preference for the single doc per user:
  batch.update(myBlockRef, {
    blockedUsers: arrayRemove({ uid: targetUid }),
  });

  // 2. Delete B's block of A (Mutual)
  const targetBlockRef = doc(firestore, "blockedIDs", targetUid);
  batch.update(targetBlockRef, {
    blockedUsers: arrayRemove({ uid: targetUid }),
  });

  await batch.commit();
};
