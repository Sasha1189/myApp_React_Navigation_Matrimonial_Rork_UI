import { Profile } from "../types/profile";

export const getDefaultProfile = (): Omit<Profile, "uid"> => ({
  photos: [],

  // Personal & Birth
  fullName: "",
  dateOfBirth: null,
  timeOfBirth: null,
  placeOfBirth: "",
  gender: "",
  maritalStatus: "",
  height: "",
  weight: "",
  bodyType: "",
  bloodGroup: "",
  manglikStatus: "",
  rashi: "",
  horoscopeRequired: "",

  // About Me
  shortBio: "",
  aspirations: "",
  beliefsValues: "",
  strengths: "",
  likesDislikesText: "",
  socialMedia: "",

  // Contact
  currentCity: "",
  nativePlace: "",
  mobileNumber: "",
  emailAddress: "",
  preferredContact: "",
  profileCreatedBy: "Self", // sensible default

  // Education & Career
  highestQualification: "",
  fieldOfStudy: "",
  occupation: "",
  industry: "",
  jobTitle: "",
  companyName: "",
  workLocation: "",
  annualIncome: "",

  // Family
  fatherOccupation: "",
  motherOccupation: "",
  numberOfBrothers: 0,
  numberOfSisters: 0,
  siblingsDetails: "",
  familyType: "",
  familyValues: "",

  // Lifestyle & Habits
  dietPreferences: "",
  smokingHabit: "",
  drinkingHabit: "",
  exerciseRoutine: "",
  fitnessLevel: "",
  hobbies: [],
  personalityType: "",
  beliefSystem: "",

  // Partner Preferences
  preferredAgeRange: null,
  preferredHeightRange: null,
  preferredMaritalStatus: "",
  manglikPreference: "",
  preferredEducation: "",
  preferredProfession: "",
  preferredIncomeRange: "",
  locationPreference: null,
  livingWithParents: "",
});
