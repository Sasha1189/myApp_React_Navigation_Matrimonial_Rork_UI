import React, {
  useMemo,
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { AuthContextType, UserTier } from "./types/auth.types";
import { calculateUserTier } from "./utils/authTierUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [tier, setTier] = useState<UserTier>("none");
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setTier("none");
        setUser(null);
        setAuthLoading(false);
        return;
      }

      // 2. FAST TRACK: Show App immediately using Cache
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        try {
          const idTokenResult = await getIdTokenResult(firebaseUser, true);
          const resolvedTier = calculateUserTier(idTokenResult);
          setTier(resolvedTier);
        } catch (error) {
          console.error(
            "[AuthContext] Failed to retrieve token claims:",
            error,
          );
          setTier("none");
        }
      } else {
        setTier("none");
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      tier,
      setUser,
      setTier,
    }),
    [user, authLoading, tier],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
