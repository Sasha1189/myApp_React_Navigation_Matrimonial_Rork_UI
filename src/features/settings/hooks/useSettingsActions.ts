import { useState } from "react";
import { Alert, Linking } from "react-native";
import { signOut } from "@react-native-firebase/auth";
import { auth, rtdb } from "@/config/firebase";
import { ref, serverTimestamp, update } from "@react-native-firebase/database";
import { useAuth } from "@/context/AuthContext";
import { clearCacheOnLogout } from "@/cache/cacheConfig";
import { useTranslation } from "react-i18next";
import { useAppNavigation } from "src/navigation/hooks";

export const useSettingsActions = () => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const WHATSAPP_NUMBER = "918554840100";
  const navigation = useAppNavigation();

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  const composeWhatsApp = async (type: "bug" | "feature" | "report-user") => {
    const heading =
      type === "bug"
        ? t("settings.waBug")
        : type === "feature"
          ? t("settings.waFeature")
          : t("settings.waReportUser");

    const preset =
      type === "bug"
        ? t("settings.waBugPreset")
        : type === "feature"
          ? t("settings.waFeaturePreset")
          : t("settings.waReportUserPreset");

    const messagePayload = `${heading} — Lonari Yuva Connect\n\n${preset}`;
    const text = encodeURIComponent(messagePayload);

    const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanNumber}?text=${text}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        t("alerts.error"),
        t("alerts.whatsappMissing", {
          defaultValue: "WhatsApp is not installed on this device.",
        }),
      );
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

            // 1. Set RTDB status to offline BEFORE revoking auth token
            if (currentUser) {
              const statusRef = ref(rtdb, `/status/${currentUser.uid}`);
              try {
                await update(statusRef, {
                  state: "offline",
                  lastChanged: serverTimestamp(),
                });
              } catch (statusErr) {
                console.log("Background status sync skipped:", statusErr);
              }
            }

            // 2. Clear local cache
            await clearCacheOnLogout();

            // 3. Revoke auth session
            await signOut(auth);
          } catch (error: any) {
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
