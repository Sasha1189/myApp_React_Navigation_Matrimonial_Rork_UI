import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { HelpCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

const { width, height } = Dimensions.get("window");

interface AuthHeaderBannerProps {}

export const AuthHeaderBanner: React.FC<AuthHeaderBannerProps> = () => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets(); // 🎯 THE FIX: Handle safe areas smoothly using local device offsets

  return (
    <View style={styles.carouselWrapper}>
      <Image
        source={require("../../../../assets/images/m1.webp")}
        style={styles.heroImage}
        contentFit="scale-down"
      />
      {/* Overlay Block container configuration mapping design color arrays */}
      <View
        style={[
          styles.floatingHeaderContainer,
          { paddingTop: Math.max(insets.top, 16) }, // Guarantees a perfectly calculated safe vertical margin
        ]}
      >
        <View style={styles.headerTopRow}>
          {/* Eliminated the empty spacer box View - layout relies on right aligned alignment styles */}
          <TouchableOpacity
            style={styles.helpButton}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                t("auth.helpAlertTitle", "Help"),
                t("auth.helpAlertMessage", "Do you need help?"),
                [
                  {
                    text: t("auth.helpAlertCancel", "Cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("auth.helpAlertCall", "Call"),
                    style: "default",
                    onPress: () => Linking.openURL("tel:8554840100"),
                  },
                ],
              );
            }}
          >
            <HelpCircle size={14} color="white" />
            <Text style={styles.helpText}>{t("auth.help", "Help")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandTitleBlock}>
          <Text style={styles.welcomeText}>{t("auth.welcome", "Welcome")}</Text>
          <Text style={styles.brandText}>
            {t("auth.brandName", "Lonari Yuva Connect")}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ================= THEME INTEGRATION LAYER =================
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    carouselWrapper: {
      width: width,
      height: height * 0.3,
      position: "relative",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    floatingHeaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.spacing.lg, // Synchronized to 24px core grid layouts
      justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.25)", // Darkened overlay slightly to guarantee white text visibility
    },
    headerTopRow: {
      flexDirection: "row",
      justifyContent: "flex-end", // Aligns help widget pill directly to the right without empty spacer views
      alignItems: "center",
    },
    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: theme.spacing.sm, // 8px padding scaling systems
      paddingVertical: 6,
      borderRadius: theme.borderRadius.round, // Clean 999px round capsule standard
      gap: theme.spacing.xs, // 4px inline gaps spacing
    },
    helpText: {
      color: "white",
      fontSize: theme.fontSize.xs, // 12px design guidelines token
      fontWeight: "600",
    },
    brandTitleBlock: {
      marginBottom: theme.spacing.md, // 16px safe margin boundary away from white sheet blocks
    },
    welcomeText: {
      fontSize: theme.fontSize.xs, // 12px description scaling rules
      color: "rgba(255,255,255,0.85)",
      fontWeight: "500",
    },
    brandText: {
      fontSize: theme.fontSize.xxl, // 26px - 32px premium header typography sizing rules
      fontWeight: "800",
      color: "white",
      marginTop: 2,
    },
  });
