import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { getDefaultProfile } from "../../../utils/getDefaultProfile"
import { Profile } from '../../../types/profile';

export const useProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  return useQuery<Profile>({
    queryKey: ["profile", uid],
    queryFn: async (): Promise<Profile> => {
      const data = await profileService.getProfile(uid, gender);
      return { ...getDefaultProfile(), ...data, uid, gender };
    },
    enabled: !!uid && !!gender, // only run if uid and gender exist
    initialData: { ...getDefaultProfile(), uid, gender },
  });
};

export const useUpdateProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) =>
      profileService.updateProfile({ uid, gender, ...data }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(["profile", uid], updatedProfile);
    },
  });
};