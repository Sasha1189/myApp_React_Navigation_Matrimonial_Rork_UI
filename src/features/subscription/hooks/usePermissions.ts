// usePermissions.ts
import { useAuth } from "@/context/AuthContext";
import { TIER_FEATURES } from "../config/permissions";

export const usePermissions = () => {
  const { tier } = useAuth();

  // Default to 'none' if tier is undefined
  const currentPermissions =
    TIER_FEATURES[tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.none;

  return currentPermissions;
};
