import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../apis/profileApi';
import { getDefaultProfile } from "../../../utils/getDefaultProfile"
import { Profile } from '../../../types/profile';

export const useProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  return useQuery<Profile>({
    queryKey: ["profile", uid],
    
    queryFn: async (): Promise<Profile> => {
      const data = await getProfile(uid, gender);
      console.log("Profile data fetched successfully");
      return { ...getDefaultProfile(), ...data, uid, gender };
    },

    enabled: !!uid && !!gender, // only run if uid and gender exist
    initialData: { ...getDefaultProfile(), uid, gender },

  });
};

export const useUpdateProfileData = (uid: string, gender: '' | 'Male' | 'Female' = '') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => {
      if (!uid || !gender) throw new Error("Missing uid or gender");
      return updateProfile({ uid, gender, ...data });
    },
    onSuccess: (updatedProfile) => {
       const normalized = {
        ...getDefaultProfile(),
        ...updatedProfile,
        uid,
        gender,
      };
      console.log("Updated cache: after profile update");
      queryClient.setQueryData<Profile>(["profile", uid], normalized);
    },
  });
};