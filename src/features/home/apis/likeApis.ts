import { Profile } from "../../../types/profile";
import { api } from "../../../services/api";

interface FeedResponse {
  profiles: Profile[];
  lastCursor?: {lastCreatedAt: string, lastId: string};
  done?: boolean;
}

// ✅ Send profileId + uid in body

export async function toggleLike(profileId: string, uid: string) {
  const api_res =api.post(`/profiles/toggle-like`, { profileId, uid });
  return api_res;
}

//Fetch like sent Ids
export async function likesSentIdsList(uid: string) {
  return api.get<{ likedIds: string[] }>(`/profiles/likes-sentIds`);
}

//Fetch like received Ids
export async function likesReceivedIdsList(uid: string) {
  return api.get<{ receivedIds: string[] }>(`/profiles/likes-receivedIds`);
}

//// Fetch full profiles for message screen

//Fetch like sent profiles
export async function likesSentProfilesList() {
  return api.get<Profile[]>(`/profiles/likes-sentProfiles`);
}

//Fetch like received profiles
export async function likesReceivedProfilesList() {
  return api.get<Profile[]>(`/profiles/likes-receivedProfiles`);
}