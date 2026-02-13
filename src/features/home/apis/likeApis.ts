import { Profile } from "../../../types/profile";
import { api } from "../../../services/api";

interface FeedResponse {
  profiles: Profile[];
  lastCursor?: { lastCreatedAt: string; lastId: string };
  done?: boolean;
}

//gemini code.....................
export async function syncLikesBatch(uid: string, likedIds: string[]) {
  console.log("📤 Sending Batch Sync to:", "/likes/batch-sync", "Body:", {
    uid,
    likedIds,
  });

  if (likedIds.length === 0) return;
  // This endpoint should use db.batch() on the backend
  // return await api.post("/likes/batch-sync", { uid, likedIds });
  try {
    const res: any = await api.post("/likes/batch-sync", { uid, likedIds });
    console.log("✅ API Response:", res.data); // See if backend returns 200
    return res;
  } catch (error: any) {
    // 🔹 This will tell you if it's a 404, 500, or Network Error
    console.error("❌ API Sync Error:", error.response?.data || error.message);
    throw error;
  }
}

export async function fetchAllLikedIds(uid: string): Promise<string[]> {
  const res = await api.get<{ likedIds: string[] }>(`/likes/sent-ids`, { uid });
  return res.likedIds || [];
}

export async function fetchLikedProfilesList(uid: string): Promise<Profile[]> {
  const res = await api.get<{ profiles: Profile[] }>("/likes/sent-profiles", {
    uid,
  });
  return res.profiles || [];
}

export async function fetchReceivedLikesSince(
  uid: string,
  since: string,
): Promise<Profile[]> {
  const res = await api.get<{ profiles: Profile[] }>(
    `/likes/received-profiles`,
    {
      uid,
      since, // 🔹 Pass the timestamp to the backend
    },
  );
  return res.profiles || [];
}
