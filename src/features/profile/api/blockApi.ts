import {
  firestore,
  writeBatch,
  doc,
  arrayUnion,
  arrayRemove,
} from "@/config/firebase";

export const blockUser = async (myUid: string, targetUid: string) => {
  if (!myUid || !targetUid) {
    throw new Error("Missing UIDs: Cannot block user.");
  }

  const batch = writeBatch(firestore);

  // 1. My Doc: Add target to 'mine' (I blocked them)
  const myRef = doc(firestore, "blockedIDs", myUid);
  batch.set(
    myRef,
    {
      mine: arrayUnion(targetUid),
    },
    { merge: true },
  );

  // 2. Target Doc: Add me to 'theirs' (They were blocked by me)
  const targetRef = doc(firestore, "blockedIDs", targetUid);
  batch.set(
    targetRef,
    {
      theirs: arrayUnion(myUid),
    },
    { merge: true },
  );

  await batch.commit();
};

export const unblockUser = async (myUid: string, targetUid: string) => {
  if (!myUid || !targetUid) {
    throw new Error("Missing UIDs: Cannot block user.");
  }

  const batch = writeBatch(firestore);

  // 1. My Doc: Remove target from 'mine'
  const myRef = doc(firestore, "blockedIDs", myUid);
  batch.set(
    myRef,
    {
      mine: arrayRemove(targetUid),
    },
    { merge: true },
  );

  // 2. Target Doc: Remove me from 'theirs'
  const targetRef = doc(firestore, "blockedIDs", targetUid);
  batch.set(
    targetRef,
    {
      theirs: arrayRemove(myUid),
    },
    { merge: true },
  );

  await batch.commit();
};
