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
import {
  appStorage,
  TIER_CACHE_KEY,
  IS_VERIFIED_CACHE_KEY,
} from "@/cacheMMKV/cacheConfig";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const cachedVer = appStorage.getBoolean(IS_VERIFIED_CACHE_KEY);
    return (cachedVer as boolean) || false;
  });
  const [tier, setTier] = useState<UserTier>(() => {
    const cached = appStorage.getString(TIER_CACHE_KEY);
    return (cached as any) || "none";
  });

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
          const idTokenResult = await getIdTokenResult(firebaseUser, false);
          const activeTier = calculateUserTier(idTokenResult);

          // 3. SYNC TIER STATE & CACHE
          setTier((currentTier) => {
            if (currentTier !== activeTier) {
              appStorage.set(TIER_CACHE_KEY, activeTier);
              return activeTier;
            }
            return currentTier;
          });

          //4. verified
          setTier((currentTier) => {
            if (currentTier !== activeTier) {
              appStorage.set(TIER_CACHE_KEY, activeTier);
              return activeTier;
            }
            return currentTier;
          });
        } catch (error) {
          console.error(
            "[AuthContext] Failed to retrieve token claims:",
            error,
          );
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
      isVerified,
      setIsVerified,
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
