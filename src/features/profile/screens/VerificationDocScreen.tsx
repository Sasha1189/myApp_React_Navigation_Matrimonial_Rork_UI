import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Edit3, CheckCircle2 } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useMyProfile } from "../context/ProfileContext";
import { useDocManager } from "../hooks/useDocManager";
import ManageDocGrid from "../components/doc/ManageDocGrid";
import UploadButton from "../components/doc/UploadButton";
import { useTranslation } from "react-i18next";
import { resolvePhotoUri } from "@/utils/photoUtils";
import { setDocPath, setVerify } from "../api/docSetPathService";

export default function VerificationDocScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const { myProfile } = useMyProfile();

  const {
    photos,
    maxPhotos,
    loading,
    addPhoto,
    deletePhoto,
    uploadPhotos,
    isVerified,
    isUploaded,
  } = useDocManager(myProfile);

  // 2. Create a Guarded Upload Function
  const handleSavePress = () => {
    uploadPhotos();
  };

  const userUid = myProfile?.uid || "";

  //...................
  const handleVerify = () => {
    setVerify(userUid);
  };

  const formattedPhotos: any = (photos || []).map((photo) => ({
    ...photo,
    downloadURL: resolvePhotoUri(photo?.downloadURL, userUid),
  }));

  if (!theme) return null;
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Photos Grid */}
        {isVerified ? (
          <View style={styles.bannerContainer}>
            <CheckCircle2 size={24} color="#15803D" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>{t("doc.congratulations")}</Text>
              <Text style={styles.messageText}>
                {t("doc.documentVerified")}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <ManageDocGrid
              photos={formattedPhotos}
              maxPhotos={maxPhotos}
              onAdd={addPhoto}
              onDelete={deletePhoto}
            />

            {/* Tip */}
            <View style={styles.tipCard}>
              <Edit3 size={20} color={theme.colors.accent} />
              <Text style={styles.tipText}>{t("doc.doctip")}</Text>
            </View>
            {/* Save Button */}
            <UploadButton
              loading={loading}
              isUploaded={isUploaded}
              onPress={handleSavePress}
            />
            <>
              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                style={styles.uploadButton}
              >
                <View style={styles.content1}>
                  // 3. Idle State
                  <Text style={styles.buttonText}>
                    {isUploaded ? t("doc.VerPending") : t("doc.Uploaddoc")}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
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
    content: { padding: 16, paddingBottom: 52 },

    tipCard: {
      backgroundColor: theme.colors.accent + "20",
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
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
      marginVertical: 10,
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

    //........
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
    content1: {
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
