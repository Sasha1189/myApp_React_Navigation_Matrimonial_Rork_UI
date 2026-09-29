import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type genderType = "" | "male" | "female";
export type UserTier = "none" | "basic" | "premium";
export type VerificationStatus = "true" | "pending" | "false";

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  gender: genderType;
  authLoading: boolean;
  tier: UserTier;
  isPaid: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setGender: (newGender: genderType) => void;
  setAuthLoading: (authLoading: boolean) => void;
  setTier: (tier: UserTier) => void;
  isVerified: VerificationStatus;
  isFullyEntitled: boolean;
  refreshToken: (forceRefresh?: boolean) => Promise<UserTier | undefined>;
  updateVerificationStatus: (status: VerificationStatus) => void;
}
