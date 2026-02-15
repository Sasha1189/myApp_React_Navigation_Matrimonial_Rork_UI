import {
  db,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from "../../../config/firebase";

import { RecentChatPartner } from "../type/messages";

export const getRoomId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

export async function createChatRoom(myUid: string, otherUser: any) {
  const roomId = getRoomId(myUid, otherUser.uid);
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      roomId,
      participants: [myUid, otherUser.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: "", // ⚡ Ensure initial load doesn't crash
      users: {
        [myUid]: { name: "Me", photo: null },
        [otherUser.uid]: {
          name: otherUser.fullName || "User",
          photo: otherUser.photo || otherUser.thumbnail || null,
        },
      },
    });
  }
  console.log("Chat room ready with ID:", roomId); // Debug log for room creation
  return roomId;
}

/**
 * 🔹 FIXED: Uses Modular getDocs & query
 */
export async function fetchRecentChatRooms(
  uid: string,
): Promise<RecentChatPartner[]> {
  console.log("chat api hit - recent chat"); // Debug log for UID
  // 1. Build the modular query
  const roomsRef = collection(db, "rooms");

  const q = query(
    roomsRef,
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc"), // ⚠️ REQUIRES COMPOSITE INDEX
  );

  // 2. Fetch using getDocs
  const snapshot = await getDocs(q);

  console.log("Fetched rooms count:", snapshot.size); // Debug log for fetched rooms

  try {
    const snapshot = await getDocs(q);
    console.log("Fetched rooms count:", snapshot.size);
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as any),
      roomId: doc.id,
    })) as RecentChatPartner[];
  } catch (error) {
    console.error("🔥 Firestore Error:", error);
    return [];
  }
}
