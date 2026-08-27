import React from "react";
import { useAuth } from "@/context/AuthContext";
import { usePresence } from "@/features/sync/hooks/usePresence";
import { useDeviceBinding } from "@/features/sync/hooks/useDeviceBinding";
import { useFeedDbSync } from "@/features/sync/hooks/useFeedDbSync";
import { useLikesSync } from "@/features/sync/hooks/useLikesSync";
import { useBlocksSync } from "@/features/sync/hooks/useBlocksSync";
import { useIsVerifiedSync } from "@/features/sync/hooks/useIsVerifiedSync";

export const AppSyncListeners: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, tier } = useAuth();

  const hasUser = Boolean(user?.uid && user?.displayName);
  const isPaid = tier === "basic" || tier === "premium";
  const isPaidUser = hasUser && isPaid;

  // 1. Paid-Only Features & Security Syncs
  useDeviceBinding(isPaidUser);
  useLikesSync(isPaidUser);
  useBlocksSync(isPaidUser);
  usePresence(isPaidUser);
  useIsVerifiedSync(user?.uid, isPaidUser);

  // 2. All-User Sync (Runs for Free, Paid, Verified, and Unverified users)
  useFeedDbSync(hasUser);

  return <>{children}</>;
};
