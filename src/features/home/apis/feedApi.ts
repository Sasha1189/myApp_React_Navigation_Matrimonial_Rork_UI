import { Profile } from "../../../types/profile";
import { api } from "../../../services/api";
import { FetchFeedResult } from "../type/type";

interface FeedResponse {
  profiles: Profile[];
  lastCreatedAt: string;
  done?: boolean;
}

export async function fetchLatestFeed({ uid, gender, lastCreatedAt }: { uid: string, gender: string, lastCreatedAt?: string }) {
  
  if (!uid && !gender) return { profiles: [], done: true };

  const params: Record<string, string> = {
    uid,
    gender,
    ...(lastCreatedAt ? { lastCreatedAt } : {}),
  };
  const res = await api.get<FetchFeedResult>("/feed/latest", params);
  return {
    profiles: res?.profiles || [],
    lastCreatedAt: res?.lastCreatedAt,
    done: res?.done ?? false,
  };
}

export async function fetchDefaultFeed({ 
  uid, 
  gender, 
  lastCreatedAt 
}: { uid: string, gender: string, lastCreatedAt?: string }): Promise<FetchFeedResult> {
  
  if (!uid || !gender) return { profiles: [], done: true };

  const params: Record<string, string> = {
    uid,
    gender,
    limit: "10",
    ...(lastCreatedAt ? { lastCreatedAt } : {}),
  };

  try {
    const res = await api.get<FetchFeedResult>("/feed/browse-all", params);
    
    console.log("Response Profiles Count:", res?.profiles?.length);

    return {
      profiles: res?.profiles || [],
      lastCreatedAt: res?.lastCreatedAt,
      done: res?.done ?? false,
    };
  } catch (error) {
    console.error("Fetch Feed API Error:", error);
    return { profiles: [], done: true };
  }
}

export async function fetchMatchedFeed({ 
  uid, 
  gender, 
  lastCreatedAt,
  preferences // 🔹 Pass user preferences here
}: { 
  uid: string, 
  gender: string, 
  lastCreatedAt?: string,
  preferences?: any 
}): Promise<FetchFeedResult> {
  
  if (!uid || !gender) return { profiles: [], done: true };

  const params: Record<string, any> = {
    uid,
    gender,
    ...(lastCreatedAt ? { lastCreatedAt } : {}),
    ...preferences, // Age, distance, etc.
  };

  const res = await api.get<FetchFeedResult>("/feed/recommended", params);
  
  return {
    profiles: res?.profiles || [],
    lastCreatedAt: res?.lastCreatedAt,
    done: res?.done ?? false,
  };
}

export async function fetchSearchFeed({ 
  uid, 
  gender, 
  lastCreatedAt,
  searchParams // 🔹 Specific filters like name, age, height
}: { 
  uid: string, 
  gender: string, 
  lastCreatedAt?: string,
  searchParams: any 
}): Promise<FetchFeedResult> {
  
  if (!uid || !gender) return { profiles: [], done: true };

  const params: Record<string, any> = {
    uid,
    gender,
    ...(lastCreatedAt ? { lastCreatedAt } : {}),
    ...searchParams,
  };

  const res = await api.get<FetchFeedResult>("/feed/search", params);
  
  return {
    profiles: res?.profiles || [],
    lastCreatedAt: res?.lastCreatedAt,
    done: res?.done ?? false,
  };
}