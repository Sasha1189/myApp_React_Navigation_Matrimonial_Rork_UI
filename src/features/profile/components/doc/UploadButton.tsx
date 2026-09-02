import React from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useTranslation } from "react-i18next";

interface Props {
  loading: boolean;
  isUploaded: boolean;
  onPress: () => void;
}

export default function UploadButton({ loading, isUploaded, onPress }: Props) {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={styles.uploadButton}
    >
      <View style={styles.content}>
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.buttonText}>{t("doc.uploading")}</Text>
          </View>
        ) : (
          // 3. Idle State
          <Text style={styles.buttonText}>
            {isUploaded ? t("doc.VerPending") : t("doc.Uploaddoc")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    uploadButton: {
      height: 56,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    content: {
      zIndex: 2, // Keeps text above the progress bar
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.card,
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });
