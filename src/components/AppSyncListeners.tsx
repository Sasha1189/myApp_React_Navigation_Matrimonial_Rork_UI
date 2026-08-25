import React from "react";
import { useAuth } from "@/context/AuthContext";
import { usePresence } from "@/features/sync/hooks/usePresence";
import { useDeviceBinding } from "@/features/sync/hooks/useDeviceBinding";
import { useProfileDbSync } from "@/features/sync/hooks/useProfileDbSync";
import { useLikesSync } from "@/features/sync/hooks/useLikesSync";
import { useBlocksSync } from "@/features/sync/hooks/useBlocksSync";

export const AppSyncListeners: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, tier } = useAuth();

  const userGender = user?.displayName?.trim().toLowerCase();
  const isGenderValid = userGender === "male" || userGender === "female";

  // 1. Online presence tracking
  usePresence(user?.uid, tier, isGenderValid ? user?.displayName : undefined);

  // 2. Hardware security verification
  useDeviceBinding();

  // 3. SQLite background profile sync
  useProfileDbSync();

  // 4. RTDB Likes sync (boot & 24h incremental)
  useLikesSync();

  // 5. RTDB Blocks sync (boot & 24h incremental)
  useBlocksSync();

  return <>{children}</>;
};
