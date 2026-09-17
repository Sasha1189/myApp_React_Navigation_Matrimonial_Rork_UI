import React, {
  useMemo,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { AuthContextType, UserTier } from "./types/auth.types";
import { fetchAndSyncUserTier } from "./utils/authTierUtils";
import { appStorage, TIER_CACHE_KEY } from "@/cacheMMKV/cacheConfig";

export interface ExtendedAuthContextType extends AuthContextType {
  refreshToken: (forceRefresh?: boolean) => Promise<UserTier | undefined>;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [tier, setTier] = useState<UserTier>(() => {
    const cached = appStorage.getString(TIER_CACHE_KEY);
    return (cached as UserTier) || "none";
  });

  const refreshToken = useCallback(async (forceRefresh = false) => {
    const currentUser = getAuth().currentUser;
    const activeTier = await fetchAndSyncUserTier(currentUser, forceRefresh);
    if (activeTier) setTier(activeTier);
    return activeTier;
  }, []);

  useEffect(() => {
    console.log("🔍 [AUTH 1/3] Attaching onAuthStateChanged listener...");
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "🔍 [AUTH 2/3] Auth state resolved | UID:",
        firebaseUser?.uid ?? "LOGGED_OUT",
      );
      try {
        if (!firebaseUser) {
          setTier("none");
          setUser(null);
          setAuthLoading(false);
          return;
        }

        setUser(firebaseUser);
        await refreshToken(false);
        setAuthLoading(false);
      } catch (error) {
        console.error("[AuthInit Error]:", error);
      } finally {
        console.log("🔍 [AUTH 3/3] Setting authLoading -> false");
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, [refreshToken]);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      tier,
      setUser,
      setAuthLoading,
      setTier,
      refreshToken,
    }),
    [user, authLoading, tier, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): ExtendedAuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
