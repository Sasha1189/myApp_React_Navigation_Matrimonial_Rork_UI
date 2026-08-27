import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type UserTier = "none" | "basic" | "premium";

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
  tier: UserTier;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setTier: (tier: UserTier) => void;
}
