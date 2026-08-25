import { Profile } from "../../types/profile";

// 1. UPDATED: Mapped to compressed short keys
export const requiredFields: (keyof Profile)[] = [
  "fn", // firstName
  "ln", // surName
  "db", // dateOfBirth
  "gender", // gender (master key)
  "ms", // maritalStatus
];

export const immutableFields: (keyof Profile)[] = [...requiredFields];

/**
 * Evaluates whether an immutable core profile field is populated and locked.
 * Explicitly flags '0' as empty/unselected for numeric enum fields.
 */
export const isFieldLocked = (
  profile: Profile | undefined,
  fieldName: keyof Profile,
) => {
  if (!profile || !immutableFields.includes(fieldName)) return false;
  const value = profile[fieldName];

  // Guard clause against empty states
  if (value === null || value === undefined) return false;

  // Core Change: Numeric enum index 0 resolves to "" (unselected), so it shouldn't be locked
  if (typeof value === "number" && value === 0) return false;

  // Guard clause against empty string spacing blocks
  return String(value).trim() !== "";
};

// 2. UPDATED: Fully updated configuration schema blocks with layout targets
export const SECTION_CONFIG = [
  {
    id: "personal",
    title: "Personal Information",
    fields: [
      "fn", // firstName
      "ln", // lastName
      "db", // dateOfBirth
      "tob", // timeOfBirth
      "pb", // placeOfBirth
      "ms", // maritalStatus
      "ht", // height
      "bt", // bodyType
      "bg", // bloodGroup
      "mg", // manglikStatus
      "rs", // rashi
      "hr", // horoscopeRequired
      "ir", // isReady
    ],
    screen: "EditPersonal",
  },
  {
    id: "about",
    title: "About Me",
    fields: [
      "sb", // shortBio
      "as", // aspirations
      "bv", // beliefsValues
      "st", // strengths
      "ld", // likesDislikesText
      "sm", // socialMedia
    ],
    screen: "EditAboutMe",
  },
  {
    id: "contact",
    title: "Contact Details",
    fields: [
      "mn", // mobileNumber
      "cc", // currentCity
      "np", // nativePlace
      "pc", // preferredContact
      "cb", // profileCreatedBy
    ],
    screen: "EditContact",
  },
  {
    id: "education",
    title: "Education & Career",
    fields: [
      "hq", // highestQualification
      "fs", // fieldOfStudy
      "oc", // occupation
      "ind", // industry
      "jt", // jobTitle
      "cn", // companyName
      "wl", // workLocation
      "ai", // annualIncome
    ],
    screen: "EditEducation",
  },
  {
    id: "family",
    title: "Family Details",
    fields: [
      "fo", // fatherOccupation
      "mo", // motherOccupation
      "nb", // numberOfBrothers
      "ns", // numberOfSisters
      "sd", // siblingsDetails
    ],
    screen: "EditFamily",
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    fields: [
      "dp", // dietPreferences
      "sh", // smokingHabit
      "dh", // drinkingHabit
      "er", // exerciseRoutine
      "fl", // fitnessLevel
      "hb", // hobbies array
      "bs", // beliefSystem
    ],
    screen: "EditLifestyle",
  },
  {
    id: "preferences",
    title: "Partner Preferences",
    fields: [
      "pms", // preferredMaritalStatus
      "pe", // preferredEducation
      "pp", // preferredProfession
      "pir", // preferredIncomeRange
      "lp", // locationPreference
      "lwp", // livingWithParents
    ],
    screen: "EditPartner",
  },
] as const;

// 3. Generates a dynamic array mapping of tracked layout keys cleanly
export const ALL_PROFILE_FIELDS = SECTION_CONFIG.flatMap(
  (section) => section.fields,
);
