import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Share2, ShieldAlert } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { AppTheme } from "@/theme/theme";

export const ProfileActionFooter = ({ onShare, onBlock, loading }: any) => {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.btn, styles.shareBtn]}
        onPress={onShare}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Share2 size={20} color="white" />
        )}
        <Text style={styles.btnText}>Share Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.blockBtn]} onPress={onBlock}>
        <ShieldAlert size={20} color={theme.colors.danger} />
        <Text style={[styles.btnText, { color: theme.colors.danger }]}>
          Block
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footer: {
      position: "absolute",
      bottom: 32,
      flexDirection: "row",
      width: "100%",
      padding: 16,
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 12,
    },
    btn: {
      flex: 1,
      flexDirection: "row",
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    shareBtn: { backgroundColor: theme.colors.primary },
    blockBtn: { borderWidth: 1, borderColor: theme.colors.danger },
    btnText: { fontWeight: "700", color: "white" },
  });
