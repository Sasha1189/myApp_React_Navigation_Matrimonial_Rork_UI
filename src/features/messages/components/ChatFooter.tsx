import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { useTranslation } from "react-i18next";

export const ChatFooter = ({
  hasMore,
  isLoadingMore,
  onLoadMore,
  mode,
}: any) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles); // Hooks are safe here at the top!
  const { t } = useTranslation();

  if (!hasMore && !isLoadingMore) return null;

  return (
    <View style={styles.footer}>
      {isLoadingMore ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <TouchableOpacity onPress={onLoadMore} style={styles.loadBtn}>
          <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
            {mode === "inbox"
              ? t("chat.footer.loadOlder")
              : t("chat.footer.loadEarlier")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footer: {
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    loadBtn: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.round, // Clean pill shape
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      minWidth: 150,
      alignItems: "center",
      // Subtle shadow for the button
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  });
