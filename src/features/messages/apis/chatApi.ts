// export async function createChatRoom(
//   myUid: string,
//   myProfile: Profile,
//   otherUser: Profile,
// ) {
//   const roomId = [myUid, otherUser.uid].sort().join("_");
//   const roomRef = doc(db, "rooms", roomId);

//   const roomSnap = await getDoc(roomRef);

//   if (!roomSnap.exists()) {
//     await setDoc(roomRef, {
//       roomId,
//       participants: [myUid, otherUser.uid],
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//       lastMessage: "", // ⚡ Ensure initial load doesn't crash
//       users: {
//         [myUid]: {
//           name: myProfile?.fullName || "User",
//           photo: myProfile?.thumbnail || null,
//         },
//         [otherUser.uid]: {
//           name: otherUser.fullName || "User",
//           photo: otherUser.thumbnail || null,
//         },
//       },
//     });
//   }
//   console.log("Chat room ready with ID:", roomId); // Debug log for room creation
//   return roomId;
// }

// export async function fetchRecentChatRooms(
//   uid: string,
// ): Promise<RecentChatPartner[]> {
//   console.log("chat api hit - recent chat"); // Debug log for UID
//   // 1. Build the modular query
//   const roomsRef = collection(db, "rooms");

//   const q = fsQuery(
//     roomsRef,
//     where("participants", "array-contains", uid),
//     orderBy("updatedAt", "desc"), // ⚠️ REQUIRES COMPOSITE INDEX
//   );

//   // 2. Fetch using getDocs

//   try {
//     const snapshot = await getDocs(q);
//     console.log("Fetched rooms count:", snapshot.size);
//     return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
//       ...(doc.data() as any),
//       roomId: doc.id,
//     })) as RecentChatPartner[];
//   } catch (error) {
//     console.error("🔥 Firestore Error:", error);
//     return [];
//   }
// }
