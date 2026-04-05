import { Share, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useAppNavigation } from "@/navigation/hooks";
import { useTranslation } from "react-i18next";
import { formatProfileForShare } from "../components/profileDetailView/shareProfile";
import { blockUser } from "../api/blockApi";
import { BlocksCache } from "@/cache/cacheConfig";

export function useSocialActions(profile: any) {
  const { tier, profile: myProfile } = useAuth();
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const handleShare = async () => {
    // 1. Tier Guard
    if (tier === "trial" || tier === "none") {
      Alert.alert(t("alerts.upgradeRequired"), t("alerts.shareRestricted"), [
        { text: t("alerts.cancel"), style: "cancel" },
        {
          text: t("alerts.upgradeNow"),
          onPress: () => navigation.navigate("Paywall"),
        },
      ]);
      return;
    }

    // 2. Share Implementation
    try {
      // Get the string from the utility
      const message = formatProfileForShare(profile, t);

      // Trigger the native share dialog
      await Share.share({
        message,
        title: t("details.actions.share"), // Useful for email subjects
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleBlock = () => {
    Alert.alert(t("details.actions.block"), t("alerts.blockConfirm"), [
      { text: t("alerts.cancel"), style: "cancel" },
      {
        text: t("details.actions.block"),
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Database Write (Atomic Batch: A blocks B AND B blocks A)
            await blockUser(myProfile, profile);

            // Update local MMKV cache with the same object structure
            BlocksCache.update(
              {
                uid: profile.uid,
                name: profile.fullName,
                photo: profile.thumbnail,
              },
              "add",
            );

            // 3. UI Feedback
            Alert.alert(t("common.success"), t("alerts.blockSuccess"));

            // 4. Navigation: Exit the profile since it is now hidden
            navigation.goBack();
          } catch (error) {
            console.error("Block Error:", error);
            Alert.alert(t("common.error"), t("alerts.blockError"));
          }
        },
      },
    ]);
  };

  return { handleShare, handleBlock };
}
