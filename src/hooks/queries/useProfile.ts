// import { useMutation, useQuery } from '@tanstack/react-query';
// import { client } from '../client';
// import { endpoints } from '../endpoints';

// export const useProfile = (userId: string) => {
//   return useQuery(['profile', userId], async () => {
//     const response = await client.get(endpoints.user.profile);
//     return response.data;
//   });
// };

// export const useUpdateProfile = () => {
//   return useMutation(async (data: any) => {
//     const response = await client.put(endpoints.user.updateProfile, data);
//     return response.data;
//   });
// };

// export const useUserPhotos = (userId: string) => {
//   return useQuery(['photos', userId], async () => {
//     const response = await client.get(endpoints.user.photos);
//     return response.data;
//   });
// };

// export const useUserSettings = () => {
//   return useQuery(['settings'], async () => {
//     const response = await client.get(endpoints.user.settings);
//     return response.data;
//   });
// };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../types/profile';

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
