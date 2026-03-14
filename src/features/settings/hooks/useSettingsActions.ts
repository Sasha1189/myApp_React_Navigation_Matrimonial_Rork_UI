import { useState } from "react";
import { Alert, Linking } from "react-native";
import { signOut } from "@react-native-firebase/auth";
import { auth, rtdb } from "@/config/firebase";
import {
  ref,
  serverTimestamp,
  update,
  goOffline,
  keepSynced,
} from "@react-native-firebase/database";
import { useAuth } from "@/context/AuthContext";
import { clearCacheOnLogout } from "@/cache/cacheConfig";
import { useTranslation } from "react-i18next";

export const useSettingsActions = () => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const WHATSAPP_NUMBER = "919921794390";

  const openLink = async (url: string, label: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert(t("common.error"), t("settings.openLinkError", { label }));
    }
  };

  const composeWhatsApp = async (type: "bug" | "feature" | "report-user") => {
    const heading =
      type === "bug"
        ? t("settings.waBug")
        : type === "feature"
          ? t("settings.waFeature")
          : t("settings.waReport");
    const preset =
      type === "bug"
        ? t("settings.waBugPreset")
        : type === "feature"
          ? t("settings.waFeaturePreset")
          : t("settings.waReportPreset");
    const text = encodeURIComponent(
      `${heading} — Lonari Youva Connect\n\n${preset}`,
    );
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`;

    try {
      await Linking.openURL(url);
    } catch {
      Linking.openURL(`https://wa.me{WHATSAPP_NUMBER}?text=${text}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(t("settings.logoutTitle"), t("settings.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true);
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              const statusRef = ref(rtdb, `/status/${currentUser.uid}`);
              await update(statusRef, {
                state: "offline",
                lastChanged: serverTimestamp(),
              });
              keepSynced(ref(rtdb, `inbox/${currentUser.uid}`), false);
            }
            await signOut(auth);
            await clearCacheOnLogout();
            setUser(null);
            goOffline(rtdb);
          } catch (error) {
            Alert.alert(t("common.error"), t("settings.logoutError"));
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return { openLink, composeWhatsApp, handleLogout, isProcessing };
};
