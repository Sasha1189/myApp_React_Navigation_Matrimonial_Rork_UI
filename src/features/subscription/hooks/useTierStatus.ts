import { useState, useEffect, useCallback } from "react";
import { getIdTokenResult } from "@react-native-firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { calculateUserTier } from "@/context";
import { UserTier } from "@/context/types/auth.types";

export interface CardState {
  isCurrentSubscription: boolean; // Active plan -> Show "Active" (No circle)
  isExpiredPlan: boolean; // Previously owned plan expired -> Show "Circle + Expired"
  showSelectCircle: boolean; // Never subscribed / Other plan -> Show "Circle"
}

export const useTierStatus = () => {
  const { user, tier: authContextTier } = useAuth();
  const [claimTier, setClaimTier] = useState<UserTier>("none");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserTier = async () => {
      if (!user) {
        if (isMounted) {
          setClaimTier("none");
          setIsExpired(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const tokenResult = await getIdTokenResult(user, false);
        const { claimTier, isExpired: expired } =
          calculateUserTier(tokenResult);

        if (isMounted) {
          setClaimTier(claimTier);
          setIsExpired(expired);
        }
      } catch (error) {
        console.error("Error fetching user claims:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserTier();

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * Calculates card state based on card tier vs user token claims
   */
  const getCardState = useCallback(
    (cardTier: UserTier): CardState => {
      const isUserActiveOnThisTier = claimTier === cardTier && !isExpired;
      const isUserExpiredOnThisTier = claimTier === cardTier && isExpired;

      // 1. Active Plan -> Show "Active" (No Circle)
      if (isUserActiveOnThisTier) {
        return {
          isCurrentSubscription: true,
          isExpiredPlan: false,
          showSelectCircle: false,
        };
      }

      // 2. Previously Owned Plan Expired -> Show "Circle + Expired"
      if (isUserExpiredOnThisTier) {
        return {
          isCurrentSubscription: false,
          isExpiredPlan: true,
          showSelectCircle: true,
        };
      }

      // 3. Never Subscribed / Other Plan -> Show "Circle"
      return {
        isCurrentSubscription: false,
        isExpiredPlan: false,
        showSelectCircle: true,
      };
    },
    [claimTier, isExpired],
  );

  return {
    claimTier,
    isExpired,
    authContextTier,
    isLoading,
    getCardState,
  };
};
