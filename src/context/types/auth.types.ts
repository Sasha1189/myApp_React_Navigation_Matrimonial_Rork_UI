import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type UserTier = "none" | "basic" | "premium";

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  tier: UserTier;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setTier: (tier: UserTier) => void;
}
