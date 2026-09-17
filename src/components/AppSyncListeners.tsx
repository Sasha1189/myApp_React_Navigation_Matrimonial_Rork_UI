import React from "react";
import { useAuth, useEntitlement } from "@/context";
import { usePresence } from "@/features/sync/hooks/usePresence";
import { useDeviceBinding } from "@/features/sync/hooks/useDeviceBinding";
import { useFeedDbSync } from "@/features/sync/hooks/useFeedDbSync";
import { useLikesSync } from "@/features/sync/hooks/useLikesSync";
import { useBlocksSync } from "@/features/sync/hooks/useBlocksSync";
import { useIsVerifiedSync } from "@/features/sync/hooks/useIsVerifiedSync";

export const AppSyncListeners: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { isPaid, isPaidTier } = useEntitlement();

  const hasUser = Boolean(user?.uid && user?.displayName);

  const isFullyEntitled = hasUser && isPaid;

  const canSyncVerification = hasUser && isPaidTier;

  console.log(
    "🔄 [APP SYNC] State | hasUser:",
    hasUser,
    "| isFullyEntitled:",
    isFullyEntitled,
    "| canSyncVerification:",
    canSyncVerification,
  );

  useDeviceBinding(isFullyEntitled);
  useLikesSync(isFullyEntitled);
  useBlocksSync(isFullyEntitled);
  usePresence(isFullyEntitled);

  useIsVerifiedSync(user?.uid ?? "", canSyncVerification);

  useFeedDbSync(hasUser);

  return <>{children}</>;
};
