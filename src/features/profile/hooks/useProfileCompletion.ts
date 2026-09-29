import { useMemo } from "react";
import { Profile } from "@/features/profile/types/profile";
import { LOOKUPS } from "@/features/utils/profileLookups";

// 1. Every single field a user can fill out across your forms
const MASTER_COMPLETION_FIELDS: (keyof Profile)[] = [
  // Core Text & Media Fields (Non-Enum)
  "fn", // fullName
  "ln", // lastName
  "db", // dateOfBirth
  "pb", // placeOfBirth
  "ht", // height
  "sb", // shortBio
  "as", // aspirations
  "bv", // beliefsValues
  "st", // strengths
  "ld", // likesDislikesText
  "sm", // socialMedia
  "cc", // currentCity
  "np", // nativePlace
  "mn", // mobileNumber
  "jt", // jobTitle
  "cn", // companyName
  "wl", // workLocation
  "fo", // fatherOccupation
  "mo", // motherOccupation
  "nb", // numberOfBrothers
  "ns", // numberOfSisters
  "sd", // siblingsDetails
  "lp", // locationPreference
  "hb", // hobbies array
  "gender",

  // Enum Fields (Automatically maps every key present in LOOKUPS)
  "ms",
  "bt",
  "bg",
  "mg",
  "rs",
  "hr",
  "pc",
  "cb",
  "hq",
  "fs",
  "oc",
  "ind",
  "ai",
  "dp",
  "sh",
  "dh",
  "er",
  "fl",
  "bs",
  "pms",
  "pe",
  "pp",
  "pir",
  "lwp",
];

export function useProfileCompletion(
  profile: Profile | null | undefined,
): number {
  return useMemo(() => {
    if (!profile) return 0;

    const completedCount = MASTER_COMPLETION_FIELDS.filter((key) => {
      const val = profile[key];

      // Check 1: Empty states
      if (val === undefined || val === null || val === "") return false;

      // Check 2: Evaluate fields using the global LOOKUPS map rules
      if (key in LOOKUPS) {
        const lookupField = key as keyof typeof LOOKUPS;
        const index = typeof val === "number" ? val : Number(val);

        // If the selection index resolves to an empty string placeholder "", consider it uncompleted
        if (!LOOKUPS[lookupField] || LOOKUPS[lookupField][index] === "") {
          return false;
        }
        return true;
      }

      // Check 3: Check arrays (like hobbies layout selections)
      if (Array.isArray(val) && val.length === 0) return false;

      return true;
    }).length;

    // The denominator is now dynamic and matches your total available form layout properties
    const totalFields = MASTER_COMPLETION_FIELDS.length;
    return Math.round((completedCount / totalFields) * 100);
  }, [profile]);
}
