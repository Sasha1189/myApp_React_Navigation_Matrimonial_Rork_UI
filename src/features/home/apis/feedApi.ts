import { Profile } from "../../../types/profile";
import { api } from "../../../src/services/api";

interface FeedResponse {
  profiles: Profile[];
  done?: boolean;
}

interface FetchFeedResult {
  items: Profile[];
  done?: boolean;
}

export async function fetchFeed(_pageParam: any, limit = 10, uid: string, gender?: string): Promise<FetchFeedResult> {
  if (!gender) return { items: [], done: false };

  const res = await api.get<FeedResponse>("/feed/browse-all", {
    gender,
    limit: limit.toString(),
    uid,
  });

  return {
  items: res.profiles,
  done: !!res.done,
  };
}

export async function likeProfile(uid: string) {
  return api.post(`/profiles/${uid}/like`);
}

export async function passProfile(uid: string) {
  return api.post(`/profiles/${uid}/pass`);
}

export async function superLikeProfile(uid: string) {
  return api.post(`/profiles/${uid}/superlike`);
}
