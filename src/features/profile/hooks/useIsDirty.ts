import { useMemo } from "react";
import { Profile } from "../../../types/profile";
import { isDeepEqual } from "src/utils/deepEqual";

const SKIP_FIELDS: (keyof Profile)[] = ["photos", "createdAt", "updatedAt"];
/**
 * Detects if form data has unsaved changes compared to profile
 */
export function useIsDirty(formData: Partial<Profile>, profile: Profile) {
  return useMemo(() => {
    return (Object.keys(formData) as (keyof Profile)[]).some((key) => {
      
      if (SKIP_FIELDS.includes(key as keyof Profile)) return false;

      return !isDeepEqual(formData[key],profile[key])
    }
    );
  }, [formData, profile]);
}
