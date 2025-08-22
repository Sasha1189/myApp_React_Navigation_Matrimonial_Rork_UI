import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../../types/profile';

export const useProfiles = (page?: string) => {
  return useQuery({
    queryKey: ['profiles', page],
    queryFn: () => profileService.getProfiles(page),
  });
};

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => profileService.getProfile(id),
    enabled: !!id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // data must include the id + update fields
    mutationFn: ({ id, data }: { id: string; data: Partial<Profile> }) =>
      profileService.updateProfile(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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