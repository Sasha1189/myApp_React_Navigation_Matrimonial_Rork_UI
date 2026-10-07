import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Star, X } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

const { width } = Dimensions.get("window");

interface Props {
  photos?: (string | unknown)[];
  maxPhotos: number;
  onAdd: () => void;
  onDelete: (photoId: string) => void;
  onSetPrimary: (photoId: string) => void;
}

export default function ManagePhotosGrid({
  photos = [],
  maxPhotos,
  onAdd,
  onDelete,
  onSetPrimary,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const validPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.filter(
      (photo): photo is string =>
        typeof photo === "string" && photo.trim().length > 0,
    );
  }, [photos]);

  const emptySlots = Math.max(0, maxPhotos - validPhotos.length);

  if (!theme) return null;

  const renderEmptySlot = (index: number) => (
    <TouchableOpacity
      key={`empty-slot-${index}`}
      style={styles.emptyPhotoSlot}
      onPress={onAdd}
      activeOpacity={0.7}
    >
      <Plus size={32} color={theme.colors.textLight} />
      <Text style={styles.addPhotoText}>Add Photo</Text>
    </TouchableOpacity>
  );
  const renderPhotoSlot = (photo: string, index: number) => {
    const isPrimary = index === 0;
    return (
      <View key={`${photo}-${index}`} style={styles.photoContainer}>
        <Image
          source={{ uri: photo }}
          style={styles.photo}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />

        {isPrimary && (
          <View style={styles.primaryBadge}>
            <Star size={16} color="white" fill="white" />
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}

        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetPrimary(photo)}
            activeOpacity={0.7}
          >
            <Star
              size={20}
              color={isPrimary ? theme.colors.warning : "white"}
              fill={isPrimary ? theme.colors.warning : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(photo)}
            activeOpacity={0.7}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.photosGrid}>
      {validPhotos.map((photo, index) => renderPhotoSlot(photo, index))}
      {Array.from({ length: emptySlots }, (_, index) => renderEmptySlot(index))}
    </View>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    photosGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    photoContainer: {
      position: "relative",
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.card,
    },
    photo: {
      width: (width - theme.spacing.lg * 3) / 2,
      height: ((width - theme.spacing.lg * 3) / 2) * 1.3,
      borderRadius: theme.borderRadius.lg,
    },
    emptyPhotoSlot: {
      width: (width - theme.spacing.lg * 3) / 2,
      height: ((width - theme.spacing.lg * 3) / 2) * 1.3,
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
    primaryBadge: {
      position: "absolute",
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      backgroundColor: theme.colors.warning,
      borderRadius: theme.borderRadius.round,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flexDirection: "row",
      alignItems: "center",
    },
    primaryText: {
      color: "white",
      fontSize: theme.fontSize.xs,
      fontWeight: "bold",
      marginLeft: theme.spacing.xs,
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
