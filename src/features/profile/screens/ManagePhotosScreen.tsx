import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Edit3 } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useMyProfile } from "../context/ProfileContext";
import { usePhotoManager } from "../hooks/usePhotoManager";
import ManagePhotosGrid from "../components/photos/ManagePhotosGrid";
import UploadButton from "../components/photos/UploadButton";
import { useTranslation } from "react-i18next";
import { resolvePhotoUri } from "@/utils/photoUtils";
import { Photo } from "@/features/profile/types/profile";

export default function ManagePhotosScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const { myProfile } = useMyProfile();

  const {
    photos,
    maxPhotos,
    isEditing,
    loading,
    progress,
    success,
    addPhoto,
    deletePhoto,
    setPrimary,
    uploadPhotos,
  } = usePhotoManager(myProfile);

  // 2. Create a Guarded Upload Function
  const handleSavePress = () => {
    uploadPhotos();
  };

  const userUid = myProfile?.uid || "";

  const formattedPhotos: Photo[] = (photos || []).map((photo) => ({
    ...photo,
    downloadURL: resolvePhotoUri(photo?.downloadURL, userUid),
  }));

  if (!theme) return null;
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Photos Grid */}
        <ManagePhotosGrid
          photos={formattedPhotos}
          maxPhotos={maxPhotos}
          onAdd={addPhoto}
          onDelete={deletePhoto}
          onSetPrimary={setPrimary}
        />

        {/* Tip */}
        <View style={styles.tipCard}>
          <Edit3 size={20} color={theme.colors.accent} />
          <Text style={styles.tipText}>{t("photos.tip")}</Text>
        </View>

        {/* Save Button */}
        <UploadButton
          loading={loading}
          progress={progress}
          success={success}
          isEditing={isEditing}
          onPress={handleSavePress}
        />
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
    content: { padding: 20, paddingBottom: 52 },

    tipCard: {
      backgroundColor: theme.colors.accent + "20",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
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
  });
