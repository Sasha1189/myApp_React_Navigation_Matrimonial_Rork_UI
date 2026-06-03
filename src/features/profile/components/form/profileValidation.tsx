import { Profile } from "../../../../types/profile";

export const requiredFields: (keyof Profile)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "maritalStatus",
];

export const immutableFields: (keyof Profile)[] = [...requiredFields];

export const isFieldLocked = (
  profile: Profile | undefined,
  fieldName: keyof Profile,
) => {
  if (!profile || !immutableFields.includes(fieldName)) return false;
  const value = profile[fieldName];
  return value !== null && value !== undefined && String(value).trim() !== "";
};

export const SECTION_CONFIG = [
  {
    id: "personal",
    title: "Personal Information",
    fields: [
      "fullName",
      "dateOfBirth",
      "timeOfBirth",
      "placeOfBirth",
      "gender",
      "maritalStatus",
      "height",
      "weight",
      "bodyType",
      "bloodGroup",
      "manglikStatus",
      "rashi",
      "horoscopeRequired",
      "isReady",
    ],
    screen: "EditPersonal",
  },
  {
    id: "about",
    title: "About Me",
    fields: [
      "shortBio",
      "aspirations",
      "beliefsValues",
      "strengths",
      "likesDislikesText",
      "socialMedia",
    ],
    screen: "EditAboutMe",
  },
  {
    id: "contact",
    title: "Contact Details",
    fields: [
      "mobileNumber",
      "currentCity",
      "nativePlace",
      "preferredContact",
      "profileCreatedBy",
    ],
    screen: "EditContact",
  },
  {
    id: "education",
    title: "Education & Career",
    fields: [
      "highestQualification",
      "fieldOfStudy",
      "occupation",
      "industry",
      "jobTitle",
      "companyName",
      "workLocation",
      "annualIncome",
    ],
    screen: "EditEducation",
  },
  {
    id: "family",
    title: "Family Details",
    fields: [
      "fatherOccupation",
      "motherOccupation",
      "numberOfBrothers",
      "numberOfSisters",
    ],
    screen: "EditFamily",
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    fields: [
      "dietPreferences",
      "smokingHabit",
      "drinkingHabit",
      "exerciseRoutine",
      "fitnessLevel",
      "hobbies",
      "beliefSystem",
    ],
    screen: "EditLifestyle",
  },
  {
    id: "preferences",
    title: "Partner Preferences",
    fields: [
      "preferredMaritalStatus",
      "preferredEducation",
      "preferredProfession",
      "preferredIncomeRange",
      "locationPreference",
      "livingWithParents",
    ],
    screen: "EditPartner",
  },
] as const;

export const ALL_PROFILE_FIELDS = SECTION_CONFIG.flatMap(
  (section) => section.fields,
);
