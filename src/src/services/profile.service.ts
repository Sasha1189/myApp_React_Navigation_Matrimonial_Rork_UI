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
    return api.get<ProfileResponse>('/profiles', params);
  },

  async getProfile(id: string): Promise<Profile> {
    return api.get<Profile>(`/profiles/${id}`);
  },

  async updateProfile(id: string, data: ProfileUpdateData): Promise<Profile> {
    // Backend expects an object containing `uid` and `gender` in the body
    // Route on server: app.use("/api/v1/profiles/update-profile", authToken, updateOrCreateProfile);
    // Send POST to /profiles/update-profile with { uid, ...data }
    return api.post<Profile>(`/profiles/update-profile`, { uid: id, ...data });
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
