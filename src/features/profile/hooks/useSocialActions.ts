import { Share, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useAppNavigation } from "@/navigation/hooks";
import { useTranslation } from "react-i18next";
import { formatProfileForShare } from "../components/profileDetailView/shareProfile";
import { blockUser } from "../api/blockApi";
import { BlocksCache } from "@/cache/cacheConfig";

export function useSocialActions(profile: any) {
  const { user, tier } = useAuth();
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const handleShare = async () => {
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

    try {
      const message = formatProfileForShare(profile, t);
      await Share.share({
        message,
        title: t("details.actions.share"),
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
            // 1. Database Write (Now passing only UIDs)
            if (user?.uid) {
              await blockUser(user?.uid, profile?.uid);
            }
            // 2. Update local MMKV (Just the ID)
            BlocksCache.update(profile.uid, "add");

            // 3. UI Feedback
            Alert.alert(t("common.success"), t("alerts.blockSuccess"));

            // 4. Navigation
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
