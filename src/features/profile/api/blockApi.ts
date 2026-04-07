import { firestore, writeBatch, doc, deleteField } from "@/config/firebase";

export const blockUser = async (myProfile: any, targetProfile: any) => {
  const batch = writeBatch(firestore);

  // 1. Prepare Mini-Objects
  const targetData = {
    name: targetProfile.fullName || "",
    photo: targetProfile.thumbnail || "",
  };

  const myData = {
    name: myProfile.fullName || "",
    photo: myProfile.thumbnail || "",
  };

  // Add B to A's Map
  const myBlockRef = doc(firestore, "blockedIDs", myProfile.uid);
  batch.set(
    myBlockRef,
    {
      [`blockedUsers.${targetProfile.uid}`]: targetData,
    },
    { merge: true },
  );

  // Add A to B's Map (Mutual)
  const targetBlockRef = doc(firestore, "blockedIDs", targetProfile.uid);
  batch.set(
    targetBlockRef,
    {
      [`blockedUsers.${myProfile.uid}`]: myData,
    },
    { merge: true },
  );

  await batch.commit();
};

export const unblockUser = async (myUid: string, targetUid: string) => {
  const batch = writeBatch(firestore);
  console.log("Unblocking User:", { targetUid });

  // Remove B from A's Map
  const myBlockRef = doc(firestore, "blockedIDs", myUid);
  batch.update(myBlockRef, {
    [`blockedUsers.${targetUid}`]: deleteField(),
  });

  // Remove A from B's Map (Mutual)
  const targetBlockRef = doc(firestore, "blockedIDs", targetUid);
  batch.update(targetBlockRef, {
    [`blockedUsers.${myUid}`]: deleteField(),
  });

  await batch.commit();
};
