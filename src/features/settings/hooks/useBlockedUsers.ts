import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { BlocksCache, BlockedUserMinimal } from "@/cache/cacheConfig";
import { unblockUser } from "@/features/profile/api/blockApi";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // 1. Load initial list from MMKV Cache (Instant)
  const [blockedList, setBlockedList] = useState<BlockedUserMinimal[]>(
    BlocksCache.getProfiles(),
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUnblock = async (targetUser: BlockedUserMinimal) => {
    if (!user || isUpdating) return;

    Alert.alert(
      t("details.actions.block"),
      `${t("alerts.unblockConfirm", "Unblock")} ${targetUser.name}?`,
      [
        { text: t("alerts.cancel"), style: "cancel" },
        {
          text: t("details.actions.unblock", "Unblock"),
          style: "destructive",
          onPress: async () => {
            setIsUpdating(true);
            try {
              // 2. Database Write (Atomic Batch for both A and B)
              await unblockUser(user.uid, targetUser.uid);

              // 3. Update Local Cache (MMKV)
              BlocksCache.update(targetUser, "remove");

              // 4. Update Local State (UI)
              setBlockedList((prev) =>
                prev.filter((p) => p.uid !== targetUser.uid),
              );

              Alert.alert(t("common.success"), t("alerts.unblockSuccess"));
            } catch (error) {
              console.error("Unblock Error:", error);
              Alert.alert(t("common.error"), t("alerts.unblockError"));
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  return {
    blockedList,
    handleUnblock,
    isUpdating,
  };
};
