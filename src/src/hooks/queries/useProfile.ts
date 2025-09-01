import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { getDefaultProfile } from "../../../utils/getDefaultProfile"
import { Profile } from '../../../types/profile';

export const useProfiles = (page?: string) => {
  return useQuery({
    queryKey: ['profiles', page],
    queryFn: () => profileService.getProfiles(page),
  });
};

export const useProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  return useQuery<Profile>({
    queryKey: ["profile", uid],
    queryFn: async (): Promise<Profile> => {
      const data = await profileService.getProfile(uid, gender);
      // ✅ Ensure fallback to a complete default profile
      return data ?? { ...getDefaultProfile(), uid, gender };
    },
    enabled: !!uid, // only run if uid exists
  });
};

export const useUpdateProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) =>
      profileService.updateProfile({ uid, gender,data }),
    onSuccess: (updatedProfile) => {
      // ✅ keep cache consistent
      queryClient.setQueryData<Profile>(["profile", uid], updatedProfile);
    },
  });
};

export const useLikeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => profileService.likeProfile(profileId),
    onSuccess: () => {
      // Invalidate profiles query to refetch
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const usePassProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => profileService.passProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useSuperLikeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => profileService.superLikeProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};