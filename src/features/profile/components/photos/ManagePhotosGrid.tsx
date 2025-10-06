import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Plus, Star, X } from "lucide-react-native";
import { theme } from "../../../../theme";
import { Photo } from "../../../../types/profile";

const { width } = Dimensions.get("window");
const photoSize = (width - theme.spacing.lg * 3) / 2;

interface Props {
  photos: Photo[];
  maxPhotos: number;
  onAdd: () => void;
  onDelete: (photoId: string) => void;
  onSetPrimary: (photoId: string) => void;
}

export default function ManagePhotosGrid({
  photos,
  maxPhotos,
  onAdd,
  onDelete,
  onSetPrimary,
}: Props) {
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
          source={{ uri: photo.localUrl || photo.downloadURL }}
          style={styles.photo}
        />

        {photo.isPrimary && (
          <View style={styles.primaryBadge}>
            <Star size={16} color="white" fill="white" />
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}

        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetPrimary(photo.id)}
          >
            <Star
              size={20}
              color={photo.isPrimary ? theme.colors.warning : "white"}
              fill={photo.isPrimary ? theme.colors.warning : "transparent"}
            />
          </TouchableOpacity>
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
        renderPhotoSlot(undefined, index)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  photoContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  photo: {
    width: photoSize,
    height: photoSize * 1.3,
    borderRadius: theme.borderRadius.lg,
  },
  emptyPhotoSlot: {
    width: photoSize,
    height: photoSize * 1.3,
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
