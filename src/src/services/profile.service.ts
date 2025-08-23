import { api } from './api';
import { Profile } from "../../types/profile";

interface ProfileResponse {
  profiles: Profile[];
  hasMore: boolean;
  nextPage?: string;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  interests?: string[];
  photos?: string[];
}

export const profileService = {
  async getProfiles(page?: string): Promise<ProfileResponse> {
    const params = page ? { page } : undefined;
  const res = await api.get<any>('/profiles', params);
  // server may return { status, profiles, ... }
  return res?.profiles ? res : { profiles: res };
  },

  async getProfile(id: string, gender?: string): Promise<Profile> {
    const params: Record<string, string> = { uid: id };
    if (gender) params.gender = gender;
    // Server route: GET /api/v1/profiles/get-profile?uid=...&gender=...
    const res = await api.get<any>(`/profiles/get-profile`, params);
    // server responds { status, profile }
    return res?.profile ? res.profile : res;
  },

  async updateProfile(id: string, data: ProfileUpdateData): Promise<Profile> {
    // Backend expects an object containing `uid` and `gender` in the body
    // Route on server: app.use("/api/v1/profiles/update-profile", authToken, updateOrCreateProfile);
    // Send POST to /profiles/update-profile with { uid, ...data }
    const res = await api.post<any>(`/profiles/update-profile`, { uid: id, ...data });
    // server responds { status, profile }
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
