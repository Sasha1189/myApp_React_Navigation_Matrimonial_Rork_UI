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
import { appStorage, TIER_CACHE_KEY } from "@/cacheMMKV/cacheConfig";
import { useVerificationSync } from "@/features/sync/hooks/useVerificationSync";
import { getUser } from "@/features/auth/services/userService";

export const VERIFIED_CACHE_KEY = "is_verified";
export const GENDER_CACHE_KEY = "gender";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [tier, setTier] = useState<UserTier>(() => {
    return (appStorage.getString(TIER_CACHE_KEY) as UserTier) || "none";
  });

  const [isVerified, setIsVerified] = useState<VerificationStatus>(() => {
    return (
      (appStorage.getString(VERIFIED_CACHE_KEY) as VerificationStatus) ||
      "false"
    );
  });

  const [gender, setGenderState] = useState<genderType>(() => {
    return (appStorage.getString(GENDER_CACHE_KEY) as genderType) || "";
  });

  // 2. Combined Setter: Updates State + MMKV together
  const setGender = useCallback((newGender: genderType) => {
    setGenderState(newGender);
    if (newGender) {
      appStorage.set(GENDER_CACHE_KEY, newGender);
    } else {
      appStorage.remove(GENDER_CACHE_KEY);
    }
  }, []);

  const updateVerificationStatus = useCallback((status: VerificationStatus) => {
    appStorage.set(VERIFIED_CACHE_KEY, status);
    setIsVerified(status);
  }, []);

  const isPaid = tier === "basic" || tier === "premium";
  const isFullyEntitled = useMemo(
    () => isPaid && isVerified === "true",
    [isPaid, isVerified],
  );

  const refreshToken = useCallback(async (forceRefresh = false) => {
    const currentUser = getAuth().currentUser;
    const activeTier = await fetchAndSyncUserTier(currentUser, forceRefresh);
    if (activeTier) setTier(activeTier);
    return activeTier;
  }, []);

  // 3. Simple Auth & Gender Bootstrapping
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setTier("none");
          setIsVerified("false");
          setGender(""); // Clears state + MMKV
          return;
        }

        setUser(firebaseUser);
        await refreshToken(false);

        const cachedGender = appStorage.getString(
          GENDER_CACHE_KEY,
        ) as genderType;
        if (cachedGender) {
          setGenderState(cachedGender);
        } else {
          const remoteUser = await getUser(firebaseUser.uid);
          setGender((remoteUser?.gender as genderType) || "");
          if (
            remoteUser.isVerified === "true" ||
            remoteUser.isVerified === "pending"
          ) {
            updateVerificationStatus(remoteUser.isVerified);
          }
        }
        console.log(
          "[Auth Context]:uid-gender-isverified-tier-authloading",
          user?.uid,
          gender,
          isVerified,
          tier,
          authLoading,
        );
      } catch (error) {
        console.error("[AuthInit Error]:", error);
      } finally {
        setAuthLoading(false);
      }
    });
  }, [refreshToken, setGender]);

  useVerificationSync(user?.uid, isPaid, isVerified, updateVerificationStatus);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      tier,
      isVerified,
      isFullyEntitled,
      isPaid,
      gender,
      setGender,
      setUser,
      setAuthLoading,
      setTier,
      refreshToken,
      updateVerificationStatus,
    }),
    [
      user,
      authLoading,
      tier,
      isVerified,
      isFullyEntitled,
      isPaid,
      gender,
      setGender,
      refreshToken,
      updateVerificationStatus,
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
