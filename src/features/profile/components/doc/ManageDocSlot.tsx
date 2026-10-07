import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Plus, X, FileCheck } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { SelectedDoc } from "../../hooks/useDocManager";

const { width } = Dimensions.get("window");

interface Props {
  doc: SelectedDoc | null;
  verified: "true" | "pending" | "false";
  onAdd: () => void;
  onDelete: () => void;
}

export default function ManageDocSlot({
  doc,
  verified,
  onAdd,
  onDelete,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  // Can only delete if the document hasn't been uploaded yet
  const canDelete = verified === "false";

  if (!doc && verified === "false") {
    return (
      <TouchableOpacity style={styles.emptySlot} onPress={onAdd}>
        <Plus size={32} color={theme.colors.textLight} />
        <Text style={styles.addText}>Select Document</Text>
      </TouchableOpacity>
    );
  }

  // If a doc is selected locally, OR if it's already pending/verified on the server
  if (doc || verified !== "false") {
    return (
      <View style={styles.docContainer}>
        <View style={styles.docInfo}>
          <FileCheck size={48} color={theme.colors.primary} />
          <Text style={styles.docName} numberOfLines={1} ellipsizeMode="middle">
            {doc ? doc.name : "Uploaded Document"}
          </Text>
        </View>

        {canDelete && doc && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <X size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    emptySlot: {
      width: width - theme.spacing.lg * 2,
      height: width * 1.2,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.md,
      alignSelf: "center",
    },
    addText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginTop: theme.spacing.xs,
    },
    docContainer: {
      width: width - theme.spacing.lg * 2,
      height: width * 1.2,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.md,
      alignSelf: "center",
      position: "relative",
      padding: theme.spacing.md,
    },
    docInfo: {
      alignItems: "center",
      justifyContent: "center",
    },
    docName: {
      marginTop: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      textAlign: "center",
      paddingHorizontal: theme.spacing.sm,
    },
    deleteButton: {
      position: "absolute",
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.xs,
    },
  });
