import React, { useState } from "react";
import { Alert } from "react-native";
import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { toggleLike } from "./useToggleLike";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

export function useButtonActions(uid: string, profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const [isLiking, setIsLiking] = useState(false);

  const { profile: myProfile, tier } = useAuth();

  const handleActionBtnTap = async (
    action: "like" | "message" | "profileDetails",
  ) => {
    if (!profile || !myProfile) return;

    const isRestricted = tier === "none";

    if ((action === "message" || action === "like") && isRestricted) {
      Alert.alert(t("alerts.upgradeRequired"), t("alerts.featureRestricted"), [
        { text: t("alerts.cancel"), style: "cancel" },
        {
          text: t("alerts.upgradeNow"),
          onPress: () => navigation.navigate("Paywall"),
        },
      ]);
      return;
    }

    if (action === "message") {
      try {
        const roomId = [myProfile.uid, profile.uid].sort().join("_");
        // 2. Navigate to Chat with all necessary RTDB context
        navigation.navigate("Chat", {
          roomId,
          uid: myProfile.uid,
          otherUser: {
            uid: profile.uid,
            name: profile.fullName,
            photo: profile.thumbnail || "",
          },
        });
      } catch (err) {
        console.error("Failed to start chat:", err);
      }
    }

    if (action === "like") {
      if (isLiking) return;
      setIsLiking(true);
      try {
        await toggleLike(
          {
            myUid: myProfile.uid,
            name: myProfile.fullName,
            photo: myProfile.thumbnail!,
          },
          {
            uid: profile.uid,
            name: profile.fullName || "User",
            photo: profile.thumbnail || "",
          },
        );
      } catch (err) {
        console.error("Like toggle failed:", err);
      } finally {
        setIsLiking(false);
      }
    }

    if (action === "profileDetails") {
      navigation.navigate("Details", { profile });
    }
  };

  return { handleActionBtnTap };
}
