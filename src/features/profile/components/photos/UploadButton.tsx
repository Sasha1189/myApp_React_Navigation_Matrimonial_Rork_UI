import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../../../theme";

interface Props {
  loading: boolean;
  isEditing: boolean;
  onPress: () => void;
}

export default function UploadButton({ loading, isEditing, onPress }: Props) {
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.uploadButton,
          (!isEditing || loading) && { opacity: 0.6 },
        ]}
        disabled={!isEditing || loading}
      >
        <Text style={styles.uploadButtonText}>
          {loading ? "Uploading..." : "Save Photos"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "700",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
});
