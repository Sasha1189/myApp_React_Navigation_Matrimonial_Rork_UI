import { Share, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useAppNavigation } from "@/navigation/hooks";
import { useTranslation } from "react-i18next";
import { formatProfileForShare } from "../components/profileDetailView/shareProfile";

export function useSocialActions(profile: any) {
  const { tier } = useAuth();
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
        onPress: () => Alert.alert("Implement Block API call here"),
      },
    ]);
  };

  return { handleShare, handleBlock };
}
