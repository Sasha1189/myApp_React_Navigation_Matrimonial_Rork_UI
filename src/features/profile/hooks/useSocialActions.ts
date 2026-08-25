import { Share, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useAppNavigation } from "@/navigation/hooks";
import { useTranslation } from "react-i18next";
import { formatProfileForShare } from "../components/profileDetailView/shareProfile";
import { toggleBlock } from "@/features/block/services/blocksService";

export function useSocialActions(profile: any) {
  const { user, tier } = useAuth();
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const handleShare = async () => {
    if (tier !== "premium") {
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
    if (!user?.uid || !profile?.uid) return;
    Alert.alert(t("details.actions.block"), t("alerts.blockConfirm"), [
      { text: t("alerts.cancel"), style: "cancel" },
      {
        text: t("details.actions.block"),
        style: "destructive",
        onPress: async () => {
          try {
            // Performs RTDB update + optimistic MMKV cache update (with error rollback)
            await toggleBlock(user?.uid, profile?.uid);

            Alert.alert(t("common.success"), t("alerts.blockSuccess"));

            navigation.goBack();
          } catch (error) {
            console.log("block error1", error);
            Alert.alert(t("common.error"), t("alerts.blockError"));
          }
        },
      },
    ]);
  };

  return { handleShare, handleBlock };
}
