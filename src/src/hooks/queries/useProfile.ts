import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../../types/profile';

export const useProfiles = (page?: string) => {
  return useQuery({
    queryKey: ['profiles', page],
    queryFn: () => profileService.getProfiles(page),
  });
};

export const useProfile = (id: string, gender?: string) => {
  return useQuery({
    queryKey: ['profile', id, gender],
    queryFn: () => profileService.getProfile(id, gender),
    enabled: !!id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // data must include the id + update fields
    mutationFn: ({ id, data }: { id: string; data: Partial<Profile> }) =>
      profileService.updateProfile(id, data),

    // Optimistic update: apply changes locally immediately, rollback on error
    onMutate: async (variables: { id: string; data: Partial<Profile> }) => {
      const { id, data } = variables;
      await queryClient.cancelQueries({ queryKey: ['profile', id] });
      await queryClient.cancelQueries({ queryKey: ['profiles'] });

      const previousProfile = queryClient.getQueryData(['profile', id]);
      const previousProfiles = queryClient.getQueryData(['profiles']);

      // Optimistically update the single profile
      queryClient.setQueryData(['profile', id], (old: any) => ({ ...(old as any), ...data }));

      // Optimistically update profiles list if present
      if (previousProfiles) {
        queryClient.setQueryData(['profiles'], (old: any) => {
          try {
            const list = (old as any).profiles ? (old as any).profiles : (old as any);
            if (Array.isArray(list)) {
              const updatedList = list.map((p: any) => (p.id === id ? { ...p, ...data } : p));
              // Keep wrapped shape if it existed
              if ((old as any).profiles) {
                return { ...(old as any), profiles: updatedList };
              }
              return updatedList;
            }
          } catch (e) {
            // noop
          }
          return old;
        });
      }

      return { previousProfile, previousProfiles };
    },

    onError: (err, variables, context: any) => {
      // rollback
      const id = variables.id;
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', id], context.previousProfile);
      }
      if (context?.previousProfiles) {
        queryClient.setQueryData(['profiles'], context.previousProfiles);
      }
    },

    // On success or settled, refetch/ensure fresh data
    onSettled: (_data, _err, variables) => {
      if (variables && variables.id) {
        queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
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