import { api } from './api';
import { Profile } from "../../types/profile";

interface ProfileResponse {
  profiles: Profile[];
  hasMore: boolean;
  nextPage?: string;
}

export const profileService = {

  async getProfile(uid: string, gender: string): Promise<Profile | undefined> {
  const params: Record<string, string> = { uid, gender };
  const res = await api.get<any>(`/profiles/get-profile`, params);
    return res.profile as Profile | undefined;
  },

  async updateProfile(payload: Partial<Profile> & { uid: string; gender: "" | "Male" | "Female" }) {
    const res = await api.post<any>(`/profiles/update-profile`, payload);
    return res?.profile ? res.profile : res;
  },
};
