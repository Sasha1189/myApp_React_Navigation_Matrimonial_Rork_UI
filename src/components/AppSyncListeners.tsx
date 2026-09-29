import React from "react";
import { useAuth } from "@/context";
import { usePresence } from "@/features/sync/hooks/usePresence";
import { useDeviceBinding } from "@/features/sync/hooks/useDeviceBinding";
import { useFeedDBSync } from "@/features/sync/hooks/useFeedDBSync";
import { useLikesSync } from "@/features/sync/hooks/useLikesSync";
import { useBlocksSync } from "@/features/sync/hooks/useBlocksSync";

export const AppSyncListeners: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, gender, isFullyEntitled } = useAuth();

  const hasUser = Boolean(user?.uid) && Boolean(gender);

  // ==========================================
  // ☁️ TIER 1: GLOBAL SYNC (Runs for all logged-in users)
  // ==========================================
  useFeedDBSync(hasUser);

  // ==========================================
  // ☁️ TIER 2: FULLY ENTITLED SYNC (Paid & Verified Only)
  // ==========================================
  useDeviceBinding(isFullyEntitled);
  useLikesSync(isFullyEntitled);
  useBlocksSync(isFullyEntitled);
  usePresence(isFullyEntitled);
  return <>{children}</>;
};
