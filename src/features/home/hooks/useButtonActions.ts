import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../profile/types/profile";
import { toggleLike } from "@/features/likes/services/likesService";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

export function useButtonActions(profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { user, tier } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const handleActionBtnTap = useCallback(
    async (action: "like" | "message" | "profileDetails") => {
      if (!profile?.uid) return;

      const isRestricted = tier === "none";

      if ((action === "message" || action === "like") && isRestricted) {
        Alert.alert(
          t("alerts.upgradeRequired"),
          t("alerts.featureRestricted"),
          [
            { text: t("alerts.cancel"), style: "cancel" },
            {
              text: t("alerts.upgradeNow"),
              onPress: () => navigation.navigate("Paywall"),
            },
          ],
        );
        return;
      }

      if (action === "message") {
        if (!user?.uid) {
          Alert.alert(
            "Complete Your Profile",
            "Please add your name and photo to use this feature.",
          );
          return;
        }
        try {
          const rId = [user.uid, profile.uid].sort().join("_");
          navigation.navigate("Chat", {
            rId,
            uid: user.uid,
            ou: {
              uid: profile.uid,
              name: profile.fn || "User",
              photo: profile.tn || "",
            },
          });
        } catch (err) {
          console.error("Failed to start chat:", err);
        }
        return;
      }

      if (action === "like") {
        if (!user?.uid) {
          Alert.alert(
            "Complete Your Profile",
            "Please add your name and photo to use this feature.",
          );
          return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
          await toggleLike(user.uid, profile.uid);
        } catch (err) {
          console.error("Like toggle failed:", err);
        } finally {
          setIsLiking(false);
        }
        return;
      }

      if (action === "profileDetails") {
        navigation.navigate("Details", { profile });
      }
    },
    [profile, tier, user, isLiking, navigation, t],
  );

  return { handleActionBtnTap };
}
