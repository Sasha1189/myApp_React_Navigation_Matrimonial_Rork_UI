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

export const useSettingsActions = () => {
  const { setUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const WHATSAPP_NUMBER = "919921794390";

  const openLink = async (url: string, label: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Error", `Couldn't open ${label}.`);
    }
  };

  const composeWhatsApp = async (type: "bug" | "feature" | "report-user") => {
    const heading =
      type === "bug"
        ? "Bug report"
        : type === "feature"
          ? "Feature request"
          : "Report user";
    const preset =
      type === "bug"
        ? "Issue:\nSteps:"
        : type === "feature"
          ? "Idea:"
          : "User ID/Reason:";
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
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
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
            Alert.alert("Error", "Could not log out.");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return { openLink, composeWhatsApp, handleLogout, isProcessing };
};
