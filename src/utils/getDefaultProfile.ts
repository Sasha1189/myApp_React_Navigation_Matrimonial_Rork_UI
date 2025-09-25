import { Profile } from "../types/profile";

// 🔹 Default/fallback profile factory
export const getDefaultProfile = (): Profile => ({
  // Core
  uid: "", // will be filled by AuthContext
  photos: [],
  likeCount: 0,
  liked: false,
  likedMe: false,
  createdAt: new Date(),
  updatedAt: new Date(),

  // Profile status
  isActive: true,
  isVerified: false,
  isPremium: false,

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
  profileCreatedBy: "Self",

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

  // Lifestyle
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
