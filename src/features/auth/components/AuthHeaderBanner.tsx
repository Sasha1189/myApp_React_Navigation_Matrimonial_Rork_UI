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
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image"; // Adjust based on your image library (react-native or expo)
import { HelpCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

interface AuthHeaderBannerProps {}

export const AuthHeaderBanner: React.FC<AuthHeaderBannerProps> = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.carouselWrapper}>
      <Image
        source={require("../../../../assets/images/m1.webp")}
        style={styles.heroImage}
        contentFit="scale-down"
      />
      <SafeAreaView style={styles.floatingHeaderContainer}>
        <View style={styles.headerTopRow}>
          <View style={{ width: 40 }} />
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
            <HelpCircle size={16} color="white" />
            <Text style={styles.helpText}>{t("auth.help", "Help")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.brandTitleBlock}>
          <Text style={styles.welcomeText}>{t("auth.welcome", "Welcome")}</Text>
          <Text style={styles.brandText}>
            {t("auth.brandName", "Brand Name")}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 24,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    zIndex: 999,
  },
  helpText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  brandTitleBlock: {
    marginBottom: -15,
  },
  welcomeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  brandText: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
    marginTop: 2,
  },
});
