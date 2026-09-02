import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Plus, X } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Photo } from "../../types/profile";

const { width } = Dimensions.get("window");

interface Props {
  photos: Photo[];
  maxPhotos: number;
  onAdd: () => void;
  onDelete: (photoId: string) => void;
}

export default function ManageDocGrid({
  photos,
  maxPhotos,
  onAdd,
  onDelete,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const emptySlots = Math.max(0, maxPhotos - photos.length);

  const renderPhotoSlot = (photo?: Photo, index?: number) => {
    if (!photo) {
      return (
        <TouchableOpacity
          key={`empty-${index}`}
          style={styles.emptyPhotoSlot}
          onPress={onAdd}
        >
          <Plus size={32} color={theme.colors.textLight} />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View key={photo.id} style={styles.photoContainer}>
        <Image
          source={photo.downloadURL || photo.localUrl}
          style={styles.photo}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />

        <View style={styles.photoActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(photo.id)}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.photosGrid}>
      {photos.map((photo, i) => renderPhotoSlot(photo, i))}
      {Array.from({ length: emptySlots }, (_, index) =>
        renderPhotoSlot(undefined, index),
      )}
    </View>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    photosGrid: {
      justifyContent: "center",
      alignItems: "center",
    },
    photoContainer: {
      position: "relative",
      marginBottom: theme.spacing.md,
    },
    photo: {
      width: width - theme.spacing.lg * 2,
      height: (width - theme.spacing.lg * 2) * 1.3,
      borderRadius: theme.borderRadius.lg,
    },
    emptyPhotoSlot: {
      width: width - theme.spacing.lg * 2,
      height: (width - theme.spacing.lg * 2) * 1.3,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.md,
    },
    addPhotoText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginTop: theme.spacing.xs,
    },

    photoActions: {
      position: "absolute",
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    actionButton: {
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.xs,
    },
    deleteButton: {
      backgroundColor: theme.colors.danger,
    },
  });
