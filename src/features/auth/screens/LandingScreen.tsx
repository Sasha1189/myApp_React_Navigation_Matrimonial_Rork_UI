import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewToken,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthNavigation } from "../../../navigation/hooks";
import { ArrowLeft } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

// Static carousel data definition
const CAROUSEL_DATA = [
  {
    id: "1",
    titleKey: "welcome.slide1.title",
    subtitleKey: "welcome.slide1.subtitle",
    image: require("../../../../assets/images/m1.webp"),
  },
  {
    id: "2",
    titleKey: "welcome.slide2.title",
    subtitleKey: "welcome.slide2.subtitle",
    image: require("../../../../assets/images/m2.webp"),
  },
  {
    id: "3",
    titleKey: "welcome.slide3.title",
    subtitleKey: "welcome.slide3.subtitle",
    image: require("../../../../assets/images/p1.webp"),
  },
  {
    id: "4",
    isWebSlide: true,
  },
];

export default function LandingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useAuthNavigation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [webLoading, setWebLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = activeIndex === CAROUSEL_DATA.length - 1;

  // Track active slide index safely
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleMainAction = () => {
    if (isLastSlide) {
      navigation.navigate("EmailSignIn");
    } else {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  if (!theme) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <LanguageSelector />
      </View>
      <View style={styles.carouselContainer}>
        {activeIndex === 3 ? (
          <View style={styles.webViewWrapper}>
            <WebView
              source={{ uri: "https://sasha1189.github.io/youva-Lonari/about" }}
              style={styles.webview}
              domStorageEnabled={true}
              javaScriptEnabled={true}
              showsVerticalScrollIndicator={true}
              onLoadStart={() => setWebLoading(true)}
              onLoadEnd={() => setWebLoading(false)}
            />
            {webLoading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary || "#1A1A4B"} // Uses Nexa Blue
                />
              </View>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={CAROUSEL_DATA}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.isWebSlide) return <View style={{ width: width }} />;
              return (
                <View style={styles.slide}>
                  <View style={styles.slideHeader}>
                    <Text style={styles.welcomeText}>
                      {t("welcome.welcome")}
                    </Text>
                    <Text style={styles.brandText}>
                      {t("welcome.brandName")}
                    </Text>
                  </View>
                  <Image
                    source={item.image}
                    style={styles.heroImage}
                    contentFit="contain"
                    transition={150}
                    cachePolicy="disk"
                  />
                  <View style={styles.textGroup}>
                    <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
                    <Text style={styles.slideSubtitle}>
                      {t(item.subtitleKey)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
      <View style={styles.paginationRow}>
        {activeIndex === 3 && (
          <TouchableOpacity
            style={[
              styles.inlineBackButton,
              { backgroundColor: theme.colors.primary || "#1A1A4B" },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              setActiveIndex(2);
              flatListRef.current?.scrollToIndex({ index: 2, animated: true });
            }}
          >
            <ArrowLeft size={22} color="#F8F8F8" />
          </TouchableOpacity>
        )}
        <Text style={styles.fractionText}>
          {activeIndex + 1}/{CAROUSEL_DATA.length}
        </Text>
        <View style={styles.dotsRow}>
          {CAROUSEL_DATA.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? theme.colors.text : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleMainAction}>
          <Text style={styles.loginButtonText}>
            {isLastSlide
              ? t("welcome.btnActionLast")
              : t("welcome.btnActionNext")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || "#F8F8F8",
    },
    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.lg,
    },
    carouselContainer: {
      flex: 1,
    },
    webViewWrapper: {
      flex: 1,
      width: width,
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
    loaderOverlay: {
      backgroundColor: theme.colors.background || "#F8F8F8",
      justifyContent: "center",
      alignItems: "center",
    },
    slide: {
      width: width,
      flex: 1,
      justifyContent: "space-between",
      paddingVertical: theme.spacing.xl,
    },
    slideHeader: {
      paddingHorizontal: theme.spacing.xl,
      marginTop: 20,
      width: "100%",
    },
    welcomeText: {
      fontSize: 16,
      color: theme.colors.textLight,
      fontWeight: "500",
    },
    brandText: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 4,
    },
    heroImage: {
      width: width * 0.85,
      height: height * 0.35,
      alignSelf: "center",
    },
    textGroup: {
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      marginBottom: 20,
    },
    slideTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    slideSubtitle: {
      fontSize: 14,
      color: theme.colors.textLight,
      marginTop: 8,
      textAlign: "center",
    },
    paginationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginBottom: 30,
      position: "relative", // 🎯 Establishes the anchor context for the absolute button layout
      width: "100%",
    },
    inlineBackButton: {
      position: "absolute",
      left: 24, // ↔️ Anchors it strictly to the left edge of the page frame
      width: 40, // 📐 Compact and professional layout size
      height: 40,
      borderRadius: 16, // 🎯 Perfect round circle mapping
      justifyContent: "center",
      alignItems: "center",
      elevation: 2, // Android shadow depth tracking
      shadowColor: "#000", // iOS shadow configurations
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      zIndex: 10, // Ensures it stays touch-responsive over background canvas layers
    },
    fractionText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textLight,
      backgroundColor: theme.colors.border + "50",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    footer: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: 40,
    },
    loginButton: {
      backgroundColor: theme.colors.primary || "#1A1A4B",
      paddingVertical: 16,
      borderRadius: 4,
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    loginButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
