import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserTier } from "../types/auth.types";

const TIER_MAPPING: Record<string, UserTier> = {
  n: "none",
  b: "basic",
  p: "premium",
};

/**
 * Parses Firebase ID token custom claims to resolve active subscription tier
 */
export function calculateUserTier(
  idTokenResult: FirebaseAuthTypes.IdTokenResult | null,
): UserTier {
  const claims = idTokenResult?.claims;

  if (!claims || !claims.t) {
    return "none";
  }

  const mappedTier = TIER_MAPPING[claims.t as string] || "none";
  const expirySeconds = (claims.e as number) || 0;
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  if (mappedTier !== "none" && currentTimeSeconds > expirySeconds) {
    return "none";
  }

  return mappedTier;
}
