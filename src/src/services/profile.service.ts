import { api } from './api';
import { Profile } from "../../types/profile";

interface ProfileResponse {
  profiles: Profile[];
  hasMore: boolean;
  nextPage?: string;
}

export const profileService = {
  async getProfiles(page?: string): Promise<ProfileResponse> {
    const params = page ? { page } : undefined;
    const res = await api.get<any>("/profiles", params);
    // server may return { status, profiles, hasMore, ... }
    if (res?.profiles) return res;
    // If server returns an array directly, wrap it.
    if (Array.isArray(res)) return { profiles: res, hasMore: false } as ProfileResponse;
    // Last-resort: attempt to coerce into the shape
    return { profiles: res?.profiles || [], hasMore: !!res?.hasMore } as ProfileResponse;
  },

  async getProfile(uid: string, gender: string): Promise<Profile | undefined> {
  const params: Record<string, string> = { uid, gender };
  const res = await api.get<any>(`/profiles/get-profile`, params);
    return res.profile as Profile | undefined;
  },

  async updateProfile({
  uid,
  gender,
  data,
}: {
  uid: string;
  gender: string;
  data: Partial<Profile>;
    }): Promise<Profile> {
    const payload = { uid, gender, ...data };
    const res = await api.post<any>(`/profiles/update-profile`, payload);
    return res?.profile ? res.profile : res;
  },

  async likeProfile(id: string): Promise<{ isMatch: boolean }> {
    return api.post<{ isMatch: boolean }>(`/profiles/${id}/like`);
  },

  async passProfile(id: string): Promise<void> {
    return api.post(`/profiles/${id}/pass`);
  },

  async superLikeProfile(id: string): Promise<{ isMatch: boolean }> {
    return api.post<{ isMatch: boolean }>(`/profiles/${id}/superlike`);
  },
};
