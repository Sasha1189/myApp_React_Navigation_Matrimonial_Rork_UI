import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Edit3, CheckCircle2, Clock } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useDocManager } from "../hooks/useDocManager";
import ManageDocSlot from "../components/doc/ManageDocSlot";
import UploadButton from "../components/doc/UploadButton";
import { useTranslation } from "react-i18next";

export default function VerificationDocScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const {
    selectedDoc,
    loading,
    isVerified, // Now safely inferred as "true" | "pending" | "false"
    pickDocument,
    removeDocument,
    uploadDocument,
  } = useDocManager();

  if (!theme) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* 3. Document Slot renders in all states. 
            (ManageDocSlot restricts clicking/deleting internally if not 'false') */}
        <ManageDocSlot
          doc={selectedDoc}
          isVerified={isVerified}
          onAdd={pickDocument}
          onDelete={removeDocument}
        />

        {/* 1. Verified State */}
        {isVerified === "true" && (
          <View style={styles.bannerContainer}>
            <CheckCircle2 size={24} color="#15803D" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>
                {t("doc.congratulations", "Congratulations")}
              </Text>
              <Text style={styles.messageText}>
                {t("doc.documentVerified", "Your document is verified.")}
              </Text>
            </View>
          </View>
        )}

        {/* 2. Pending State */}
        {isVerified === "pending" && (
          <View style={[styles.bannerContainer, styles.pendingBanner]}>
            <Clock size={24} color="#B45309" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={[styles.titleText, { color: "#92400E" }]}>
                {t("doc.verPendingTitle", "Verification is pending")}
              </Text>
              <Text style={[styles.messageText, { color: "#B45309" }]}>
                {t("doc.verPendingMsg", "We are reviewing your document.")}
              </Text>
            </View>
          </View>
        )}

        {/* 4. Upload UI (Only show if NOT verified and NOT pending) */}
        {isVerified === "false" && (
          <>
            <View style={styles.tipCard}>
              <Edit3 size={20} color={theme.colors.accent} />
              <Text style={styles.tipText}>
                {t(
                  "doc.doctip",
                  "Please upload a clear copy of your document.",
                )}
              </Text>
            </View>

            <UploadButton loading={loading} onPress={uploadDocument} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 52,
    },
    tipCard: {
      backgroundColor: theme.colors.accent + "20",
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginVertical: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
    },
    tipText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
    bannerContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#DCFCE7",
      borderColor: "#86EFAC",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginVertical: theme.spacing.md,
    },
    pendingBanner: {
      backgroundColor: "#FEF3C7", // Amber-100
      borderColor: "#FCD34D", // Amber-300
    },
    icon: {
      marginRight: 10,
    },
    textContainer: {
      flex: 1,
    },
    titleText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#166534",
      marginBottom: 2,
    },
    messageText: {
      fontSize: 12,
      color: "#15803D",
      fontWeight: "500",
    },
  });
