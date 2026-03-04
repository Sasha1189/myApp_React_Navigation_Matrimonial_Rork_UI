import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Edit3 } from "lucide-react-native";
import { theme } from "../../../theme";
import { useProfileContext } from "../../../context/ProfileContext";
import { usePhotoManager } from "../hooks/usePhotoManager";
import ManagePhotosGrid from "../components/photos/ManagePhotosGrid";
import UploadButton from "../components/photos/UploadButton";

export default function ManagePhotosScreen() {
  const { profile } = useProfileContext();

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
  } = usePhotoManager(profile);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Photos Grid */}
        <ManagePhotosGrid
          photos={photos}
          maxPhotos={maxPhotos}
          onAdd={addPhoto}
          onDelete={deletePhoto}
          onSetPrimary={setPrimary}
        />

        {/* Save Button */}
        <UploadButton
          loading={loading}
          progress={progress}
          success={success}
          isEditing={isEditing}
          onPress={uploadPhotos}
        />

        {/* Tip */}
        <View style={styles.tipCard}>
          <Edit3 size={20} color={theme.colors.accent} />
          <Text style={styles.tipText}>
            Tap star to set primary. Tap X to delete.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.xs,
  },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.lg },

  tipCard: {
    backgroundColor: theme.colors.accent + "20",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
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
