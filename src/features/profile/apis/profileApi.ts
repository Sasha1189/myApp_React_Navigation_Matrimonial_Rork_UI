import { api } from '../../../services/api';
import { Profile } from "../../../types/profile";

interface ProfileApiResponse {
  profile?: Profile;
}

export async function getProfile(uid: string, gender: string): Promise<Profile | undefined> {
  const params: Record<string, string> = { uid, gender };
  const res = await api.get<ProfileApiResponse>(`/profiles/get-profile`, params);
  return res?.profile;
}
  
// ✅ Update profile & return normalized response
export async function updateProfile(payload: Partial<Profile> & { uid: string; gender: "" | "Male" | "Female" }): Promise<Profile> {
  const res = await api.post<ProfileApiResponse>(`/profiles/update-profile`, payload);
  return res?.profile ?? ({} as Profile);
}