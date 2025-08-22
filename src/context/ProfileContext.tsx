import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../utils/apiClient";
import { useAuth } from "./AuthContext";
import { Profile } from "../types/profile";

// export interface Profile {
//   uid?: string;
//   gender: string;
//   fullname: string;
//   aboutme: string;
//   education: string;
//   work: string;
//   height: string;
//   dob: string;
//   hobbies: string;
//   income: string;
//   livesin: string;
//   hometown: string;
//   maritalStatus: string;
//   familyDetails: string;
//   partnerExpectations: string;
//   profileImages: string[];
// }

interface ProfileContextType {
  profile: Partial<Profile>;
  loading: boolean;
  // reloadProfile: () => Promise<void>;
  // updateProfile?: (fieldsToUpdate: Partial<Profile>) => Promise<any>;
  // updateProfileImages?: (uploadedUrls: string[]) => Promise<any>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Partial<Profile>>({
    fullName: "",
    dateOfBirth: new Date(),
    timeOfBirth: "",
    placeOfBirth: "",
    gender: "Male",
    maritalStatus: "Never Married",
    height: "",
    weight: "",
    bodyType: "Average",
    bloodGroup: "O+",

    manglikStatus: "Don't Know",
    rashi: "Aries",
    horoscopeRequired: "Optional",
    shortBio: "",
    lifeGoals: "",
    beliefsValues: "",
    strengths: "",
    likesDislikesText: "",
    socialMedia: "",
    currentCity: "",

    nativePlace: "",
    mobileNumber: "",
    emailAddress: "",
    preferredContact: "Phone",
    profileCreatedBy: "Self",
    highestQualification: "Bachelor's",
    fieldOfStudy: "Engineering",
    currentOccupation: "Working",
    industry: "IT",
    jobTitle: "",

    companyName: "",
    workLocation: "",
    annualIncome: "₹5L+",
    fatherOccupation: "",
    motherOccupation: "",
    numberOfBrothers: 0,
    numberOfSisters: 0,
    siblingsDetails: "",
    familyType: "Nuclear",
    familyValues: "Modern",

    dietPreferences: "Vegetarian",
    smokingHabit: "No",
    drinkingHabit: "No",
    exerciseRoutine: "Sometimes",
    fitnessLevel: "Average",
    hobbies: [],
    personalityType: "Ambivert",
    beliefSystem: "Open-minded",
    preferredAgeRange: { min: 25, max: 35 },
    preferredHeightRange: { min: "5'0''", max: "6'0''" },

    preferredMaritalStatus: "Never Married",
    manglikPreference: "Don't Know",
    preferredEducation: "Graduate",
    preferredProfession: "Working Professional",
    preferredIncomeRange: "₹5L+",
    locationPreference: "",
    livingWithParents: "Okay",
  });

  //   const loadProfile = async () => {
  //     if (!uid) {
  //       setLoading(false);
  //       return;
  //     }
  //     setLoading(true);
  //     try {
  //       // TODO: restore AsyncStorage + API fetch logic
  //     } catch (error) {
  //       console.error("Failed to load profile:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const profileLoadedOnce = useRef(false);

  // Example: trigger loadProfile once when user logs in
  //   useEffect(() => {
  //     if (uid && !profileLoadedOnce.current) {
  //       profileLoadedOnce.current = true;
  //       loadProfile();
  //     }
  //   }, [uid]);

  const value: ProfileContextType = useMemo(
    () => ({
      profile,
      loading,
      //   reloadProfile: loadProfile,
      // updateProfile,
      // updateProfileImages,
    }),
    [profile, loading]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
