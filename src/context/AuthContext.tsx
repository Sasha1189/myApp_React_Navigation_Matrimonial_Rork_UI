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
import {
  AuthContextType,
  genderType,
  UserTier,
  VerificationStatus,
} from "./types/auth.types";
import { fetchAndSyncUserTier } from "./utils/authTierUtils";
import {
  getVerifiedCache,
  getGenderCache,
  setGenderCache,
  getTierCache,
  setVerifiedCache,
  setCachedProfile,
} from "@/cacheMMKV/cacheConfig";
import { getUser } from "@/features/auth/api/userApi";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [tier, setTier] = useState<UserTier>(() => {
    return getTierCache() || "none";
  });
  const [verified, setVerified] = useState<VerificationStatus>(() => {
    return getVerifiedCache() || "false";
  });
  const [gender, setGender] = useState<genderType>(() => {
    return getGenderCache() || "";
  });

  const isPaid = tier === "basic" || tier === "premium";
  const isFullyEntitled = useMemo(
    () => isPaid && verified === "true",
    [isPaid, verified],
  );

  const refreshToken = useCallback(async (forceRefresh = false) => {
    const currentUser = getAuth().currentUser;
    const activeTier = await fetchAndSyncUserTier(currentUser, forceRefresh);
    if (activeTier) setTier(activeTier);
    return activeTier;
  }, []);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      try {
        if (!firebaseUser) {
          setUser(null);
          setTier("none");
          setVerified("false");
          setGender("");
          return;
        }

        const cachedGender = getGenderCache();

        if (cachedGender) {
          refreshToken(false).catch((err) =>
            console.error("[Token Refresh Error]:", err),
          );
          setGender(cachedGender);
        } else {
          const [_, userData] = await Promise.allSettled([
            refreshToken(true),
            getUser(firebaseUser.uid),
          ]);
          if (userData.status === "fulfilled" && userData.value?.gender) {
            setGenderCache(userData.value.gender as genderType);
            setGender(userData.value.gender as genderType);
            if (userData.value?.verified) {
              setVerified(userData.value.verified as VerificationStatus);
              setVerifiedCache(userData.value.verified as VerificationStatus);
            }
          }
        }
        setUser(firebaseUser);
      } catch (error) {
        console.error("[AuthInit Error]:", error);
      } finally {
        setAuthLoading(false);
      }
    });
  }, [refreshToken]);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      tier,
      verified,
      isFullyEntitled,
      isPaid,
      gender,
      setGender,
      setUser,
      setAuthLoading,
      setTier,
      refreshToken,
    }),
    [
      user,
      authLoading,
      tier,
      verified,
      isFullyEntitled,
      isPaid,
      gender,
      refreshToken,
    ],
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
