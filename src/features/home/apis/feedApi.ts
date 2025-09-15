import { Profile } from "../../../types/profile";
import { api } from "../../../services/api";

interface FeedResponse {
  profiles: Profile[];
  lastCursor?: {lastCreatedAt: string, lastId: string};
  done?: boolean;
}

export async function fetchFeed(page: number, limit: number, uid: string, gender: string,
  filters?: Record<string, any>, reset = false) {

  if (!uid && !gender) return { profiles: [], done: false };

  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    uid,
    gender,
    ...Object.fromEntries(Object.entries(filters ?? {}).map(([k, v]) => [k, String(v)])),
    ...(reset ? { reset: "true" } : {}),
  };

  return await api.get<FeedResponse>("/feed/browse-all", params);
}


/////////////////