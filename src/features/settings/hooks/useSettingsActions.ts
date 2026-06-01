import { useState } from "react";
import { Alert, Linking } from "react-native";
import { signOut } from "@react-native-firebase/auth";
import { auth, rtdb } from "@/config/firebase";
import {
  ref,
  serverTimestamp,
  update,
  off,
  goOffline,
  keepSynced,
} from "@react-native-firebase/database";
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
      console.error("WhatsApp redirection failed:", error);
    }
  };

  const handleLogout = () => {
    console.log("Logout trigger initialized - Displaying Alert Box");

    Alert.alert(t("settings.logoutTitle"), t("settings.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          console.log("User confirmed logout process execution");
          setIsProcessing(true);

          try {
            const currentUser = auth.currentUser;

            if (currentUser) {
              console.log(
                "Updating network status to offline for UID:",
                currentUser.uid,
              );
              const statusRef = ref(rtdb, `/status/${currentUser.uid}`);

              // Fire-and-forget update prevents network thread hanging freezes
              update(statusRef, {
                state: "offline",
                lastChanged: serverTimestamp(),
              }).catch((err) =>
                console.log("Background status sync skipped:", err.message),
              );
            }

            // 👑 FIX 1: Purge application local caches and terminate DB first while session tokens are valid
            console.log("Purging Local Application Caches safely");
            try {
              await clearCacheOnLogout();
            } catch (cacheError) {
              console.error(
                "Cache purge failed but continuing cleanup chain:",
                cacheError,
              );
            }

            // 👑 FIX 2: Invoke Native Firebase SignOut second now that database links are closed safely
            console.log("Invoking Native Firebase SignOut");
            await signOut(auth);

            console.log("Resetting Auth Context State to Null");
            setUser(null);

            console.log("Logout routine finished successfully.");
          } catch (error: any) {
            console.error("CRITICAL: Logout pipeline crashed:", error);
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
