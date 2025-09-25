import { useEffect, useState } from "react";
import { Profile } from "../../../types/profile";

/**
 * Tracks required fields that are already saved and thus immutable
 */
export function useConfirmedImmutable(profile: Profile | null, requiredFields: (keyof Profile)[]) {
  const [confirmedImmutable, setConfirmedImmutable] = useState<(keyof Profile)[]>([]);

  useEffect(() => {
    if (!profile) return;

    const initiallyConfirmed = requiredFields.filter((k) => {
      const v = profile[k];
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      return true;
    });

    setConfirmedImmutable(initiallyConfirmed);
  }, [profile, requiredFields]);

  return confirmedImmutable;
}
