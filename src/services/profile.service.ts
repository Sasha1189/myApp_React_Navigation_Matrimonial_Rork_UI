import { api } from './api';
import { Profile } from '../types/profile';

interface ProfileResponse {
  profiles: Profile[];
  hasMore: boolean;
  nextPage?: string;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  interests?: string[];
  // Client canonical field is `images` but backend historically expects `photos`.
  // Accept either and map to backend `photos` before sending.
  images?: string[];
  profileImages?: string[];
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

  // async updateProfile(data: ProfileUpdateData): Promise<Profile> {
  //   // Normalize image fields: prefer `images`, then `profileImages`, then `photos`.
  //   const payload: any = { ...data };
  //   const imgs = data.images || data.profileImages || data.photos;
  //   if (imgs) {
  //     // Backend expects `photos` in many endpoints — send that.
  //     payload.photos = imgs;
  //     // remove alternate keys to keep payload clean
  //     delete payload.images;
  //     delete payload.profileImages;
  //   }
  //   return api.put<Profile>(`/profiles/`, payload);
  // },

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
