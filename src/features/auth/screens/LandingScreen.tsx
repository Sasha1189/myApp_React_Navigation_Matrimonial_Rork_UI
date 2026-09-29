import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuthNavigation } from "../../../navigation/hooks";
import { AppTheme } from "@/theme/theme";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { CarouselPagination } from "../components/CarouselPagination";

const { width, height } = Dimensions.get("window");

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
  { id: "4", isWebSlide: true }, // Placeholder node to hold layout page space
];

const BULLETPROOF_INJECTED_JS = `
  (function() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      if (deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY) && startX < 60) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EDGE_SWIPE_BACK' }));
      }
    }, { passive: true });
  })();
  true;
`;

export default function LandingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useAuthNavigation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [webLoading, setWebLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = activeIndex === CAROUSEL_DATA.length - 1;

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleWebViewMessage = (event: any) => {
    try {
      const messageData = JSON.parse(event.nativeEvent.data);
      if (messageData.type === "EDGE_SWIPE_BACK") {
        // Explicitly forces FlatList navigation to index 2 (Slide 3)
        flatListRef.current?.scrollToIndex({
          index: 2,
          animated: true,
        });
      }
    } catch (e) {
      console.warn("Failed parsing WebView message payload", e);
    }
  };

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
        <FlatList
          ref={flatListRef}
          data={CAROUSEL_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={false} // Crucial: Keeps your hidden track nodes alive
          scrollEnabled={true}
          renderItem={({ item }) => {
            if (item.isWebSlide) {
              return (
                <View style={{ width: width, flex: 1 }}>
                  <WebView
                    source={{
                      uri: "https://sasha1189.github.io/youva-Lonari/about",
                    }}
                    style={[styles.webview, { flex: 1 }]}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    injectedJavaScript={BULLETPROOF_INJECTED_JS}
                    onMessage={handleWebViewMessage} // Listens for bridge event execution
                    nestedScrollEnabled={true}
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => setWebLoading(false)}
                  />
                  {webLoading && (
                    <View style={styles.loaderOverlay}>
                      <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                </View>
              );
            }
            return (
              <View style={styles.slide}>
                <View style={styles.slideHeader}>
                  <Text style={styles.welcomeText}>{t("welcome.welcome")}</Text>
                  <Text style={styles.brandText}>{t("welcome.brandName")}</Text>
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
      </View>

      {/* ================= REUSABLE PAGINATION SUB-COMPONENT ================= */}
      <CarouselPagination
        activeIndex={activeIndex}
        totalSlides={CAROUSEL_DATA.length}
      />

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
      position: "relative", // 🎯 Stacking context anchor for background pre-rendering WebView
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
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.background || "#F8F8F8",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
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
    // ================= EXCHANGING EXACT EXISTING PAGINATION LAYOUTS =================
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
