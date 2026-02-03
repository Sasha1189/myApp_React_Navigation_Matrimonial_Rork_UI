import { api } from "../services/api";
import { Profile } from "../types/profile";

type GenderShard = "Male" | "Female";

interface ProfileApiResponse {
  profile?: Profile;
}

export async function getProfile(uid: string, gender: string): Promise<Profile | undefined> {

   if (!gender || gender === "Other") {
    console.warn("Attempted to fetch profile without a valid gender shard");
  }
  const params: Record<string, string> = { uid, gender };

  const res = await api.get<ProfileApiResponse>(`/profiles/get-profile`, params);
  
  return res?.profile;
}
  
// ✅ Update profile & return normalized response
export async function updateProfile(payload: Partial<Profile> & { uid: string; gender: "" | "Male" | "Female" }): Promise<Profile> {
 
  const res = await api.post<ProfileApiResponse>(`/profiles/update-profile`, payload);

  if (!res?.profile) {
    throw new Error("Update failed: No profile returned from server");
  }

  return res?.profile ?? ({} as Profile);
}