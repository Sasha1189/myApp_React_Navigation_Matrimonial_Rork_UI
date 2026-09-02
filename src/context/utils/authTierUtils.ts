import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserTier } from "../types/auth.types";

const TIER_MAPPING: Record<string, UserTier> = {
  n: "none",
  b: "basic",
  p: "premium",
};

export interface UserTierResult {
  activeTier: UserTier;
  claimTier: UserTier; // Original tier from token claims
  isExpired: boolean;
}

export function calculateUserTier(
  idTokenResult: FirebaseAuthTypes.IdTokenResult | null,
): UserTierResult {
  const claims = idTokenResult?.claims;

  const tierClaim = claims?.t;

  if (!tierClaim) {
    return { activeTier: "none", claimTier: "none", isExpired: false };
  }

  const mappedTier = (TIER_MAPPING[tierClaim as string] as UserTier) || "none";

  if (mappedTier === "none") {
    return { activeTier: "none", claimTier: "none", isExpired: false };
  }

  const expirySeconds = Number(claims?.e) || 0;
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  const isExpired = expirySeconds > 0 && currentTimeSeconds >= expirySeconds;

  return {
    activeTier: isExpired ? "none" : mappedTier,
    claimTier: mappedTier,
    isExpired,
  };
}
