import { useMemo } from "react";
import { Profile } from "../../../types/profile";

/**
 * Detects if form data has unsaved changes compared to profile
 */
export function useIsDirty(formData: Partial<Profile>, profile: Profile) {
  return useMemo(() => {
    return (Object.keys(formData) as (keyof Profile)[]).some(
      (key) => formData[key] !== profile[key]
    );
  }, [formData, profile]);
}
