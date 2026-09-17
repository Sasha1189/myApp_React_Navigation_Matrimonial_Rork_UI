import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/features/profile/context/ProfileContext";

export const checkIsPaid = (tier?: string, isVerified?: boolean): boolean => {
  const isPaidTier = tier === "basic" || tier === "premium";
  return isPaidTier && Boolean(isVerified);
};

export const useEntitlement = () => {
  const { user, tier } = useAuth();
  const { myProfile } = useMyProfile();

  if (!user) {
    return {
      isPaid: false,
      isUnpaid: true,
      isPaidTier: false,
      isVerified: false,
      tier: undefined,
    };
  }
  const isVerified = Boolean(myProfile?.iv);
  const isPaid = checkIsPaid(tier, isVerified);

  return {
    isPaid,
    isUnpaid: !isPaid,
    isPaidTier: tier === "basic" || tier === "premium",
    isVerified,
    tier,
  };
};
