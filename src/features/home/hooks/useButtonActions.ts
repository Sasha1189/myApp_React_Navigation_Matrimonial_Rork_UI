import { useState } from "react";
import { Alert } from "react-native";
import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { toggleLike } from "./useToggleLike";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

export function useButtonActions(profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const [isLiking, setIsLiking] = useState(false);

  const { user, myProfile, tier } = useAuth();

  const handleActionBtnTap = async (
    action: "like" | "message" | "profileDetails",
  ) => {
    if (!profile?.uid) return;

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
      if (!myProfile?.uid) {
        Alert.alert(
          "Complete Your Profile",
          "Please add your name and photo to use this feature.",
        );
        return;
      }
      try {
        const roomId = [user?.uid, profile.uid].sort().join("_");
        const navigationPayload = {
          roomId,
          uid: user?.uid as string,
          otherUser: {
            uid: profile.uid,
            name: profile.fullName || "User",
            photo: profile.thumbnail || "",
          },
        };
        navigation.navigate("Chat", navigationPayload);
      } catch (err) {
        console.error("Failed to start chat:", err);
      }
    }

    if (action === "like") {
      if (!myProfile?.uid) {
        Alert.alert(
          "Complete Your Profile",
          "Please add your name and photo to use this feature.",
        );
        return;
      }
      if (isLiking) return;
      setIsLiking(true);
      try {
        await toggleLike(
          {
            myUid: myProfile.uid,
            name: myProfile.fullName,
            photo: myProfile.thumbnail as string,
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
