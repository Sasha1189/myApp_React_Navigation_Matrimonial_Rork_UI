import React, { useRef, useState, useEffect } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
} from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Profile } from "../../../types/profile";
import { formatDOB } from "../../../utils/dateUtils";
import { ActionButtons } from "../components/ActionButtons";
import { useButtonActions } from "../hooks/useButtonActions";
import { useTranslation } from "react-i18next";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SWIPE_THRESHOLD = screenHeight * 0.2;

const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  uid: string;
  profile: Profile;
  currentIndex: number;
  nextImageUrl?: string | null;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  isTopCard: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  uid,
  profile,
  currentIndex,
  nextImageUrl,
  onSwipeUp,
  onSwipeDown,
  isTopCard,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  useEffect(() => {
    if (nextImageUrl) {
      Image.prefetch(nextImageUrl);
    }
  }, [nextImageUrl]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const cardWidth = screenWidth - 20;
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (!isTopCard) return false;
        // Capture only if vertical pull is dominant
        return (
          Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
          Math.abs(gesture.dy) > 5
        );
      },
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        const isFast = Math.abs(gesture.vy) > 0.5;
        if (gesture.dy < -SWIPE_THRESHOLD || (gesture.dy < -50 && isFast)) {
          forceSwipe("up");
        } else if (
          (gesture.dy > SWIPE_THRESHOLD || (gesture.dy > 50 && isFast)) &&
          currentIndex > 0
        ) {
          forceSwipe("down");
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  // 1. Update forceSwipe to ONLY trigger the parent update
  const forceSwipe = (direction: "up" | "down") => {
    const toValue = direction === "up" ? -screenHeight : screenHeight;

    Animated.spring(translateY, {
      toValue,
      velocity: 3,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      // Call the parent update
      if (direction === "up") {
        onSwipeUp();
      } else {
        onSwipeDown();
      }
    });
  };

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    translateY.setValue(0);
  }, [uid]);

  const animatedCardStyle = { transform: [{ translateY: translateY }] };

  const nextOpacity = translateY.interpolate({
    inputRange: [-screenHeight / 6, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const previousOpacity = translateY.interpolate({
    inputRange: [0, screenHeight / 6],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const { handleActionBtnTap } = useButtonActions(uid, profile);

  if (!theme) return null;
  return (
    <Animated.View
      style={[styles.card, animatedCardStyle]}
      {...panResponder.panHandlers}
    >
      <View style={styles.imageContainer}>
        <FlatList
          data={profile?.photos || [null]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={isTopCard}
          keyExtractor={(_, index) => index.toString()}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.slideFrame}>
              <Image
                source={
                  item?.downloadURL
                    ? { uri: item.downloadURL }
                    : require("../../../../assets/images/profile.png")
                }
                style={styles.image}
                contentFit="cover"
                cachePolicy="disk"
                transition={400}
                placeholderContentFit="cover"
              />
            </View>
          )}
        />
      </View>

      {/* 2. SMOOTH GRADIENT OVERLAY */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* CLEAN INDICATORS AT BOTTOM */}
      <View style={styles.imageIndicators}>
        {profile?.photos?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* 3. PREMIUM CONTENT LAYOUT */}
      <View style={styles.cardContent}>
        <View style={styles.nameAgeRow}>
          <Text style={styles.name} numberOfLines={1}>
            {profile?.fullName}
          </Text>
          <Text style={styles.age}>
            {formatDOB(profile.dateOfBirth, "age")}
          </Text>
          {/* NEW: READY PILL POSITIONED NEXT TO AGE */}
          <View
            style={[
              styles.readyPill,
              {
                backgroundColor:
                  profile?.isReady === "Yes"
                    ? theme.colors.primary
                    : `${theme.colors.primary}12`,
              },
            ]}
          >
            <Sparkles size={10} color="white" />
            <Text style={styles.readyPillText}>
              {profile?.isReady === "Yes"
                ? t("card.ready")
                : t("card.planning")}
            </Text>
          </View>
        </View>

        {/* GLASSMORPHISM BADGES */}
        <View style={styles.badgeRow}>
          {profile?.occupation && (
            <View style={styles.glassBadge}>
              <Briefcase size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.badgeText}>{profile.occupation}</Text>
            </View>
          )}
          {profile?.fieldOfStudy && (
            <View style={styles.glassBadge}>
              <GraduationCap size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.badgeText}>{profile.fieldOfStudy}</Text>
            </View>
          )}
        </View>
        {/* PARALLEL GLASS BADGES (CITY & STUDY) */}
        <View style={styles.badgeRow}>
          {profile?.currentCity && (
            <View style={styles.glassBadge}>
              <MapPin size={12} color="white" />
              <Text style={styles.badgeText}>{profile.currentCity}</Text>
            </View>
          )}
        </View>

        {/* OCCUPATION & BIO */}
        {profile?.shortBio && (
          <Text style={styles.bio} numberOfLines={1}>
            {profile?.shortBio}
          </Text>
        )}
      </View>

      {/* 4. FLOATING ACTION BUTTONS */}
      <View style={styles.floatingActions}>
        <ActionButtons
          onLike={() => handleActionBtnTap("like")}
          onMessage={() => handleActionBtnTap("message")}
          onProfileDetails={() => handleActionBtnTap("profileDetails")}
          liked={profile?.liked}
        />
      </View>
      {/* NEXT LABEL (Swiping Up) */}
      <Animated.View
        pointerEvents="none"
        style={[styles.statusLabel, styles.nextLabel, { opacity: nextOpacity }]}
      >
        <Text style={styles.statusLabelText}>{t("card.next")}</Text>
      </Animated.View>

      {/* PREVIOUS LABEL (Swiping Down) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.statusLabel,
          styles.prevLabel,
          { opacity: previousOpacity },
        ]}
      >
        <Text style={styles.statusLabelText}>{t("card.previous")}</Text>
      </Animated.View>
    </Animated.View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      position: "absolute",
      width: screenWidth - 12 * 2,
      height: screenHeight * 0.73, // Slightly tighter height
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: "hidden",
    },
    imageContainer: { width: "100%", height: "100%" },
    slideFrame: { width: screenWidth - 12 * 2, height: "100%" },
    image: { width: "100%", height: "100%" },

    // INDICATORS AT TOP
    imageIndicators: {
      position: "absolute",
      bottom: 12,
      left: 20,
      right: 20, // Leave room for actions
      flexDirection: "row",
      gap: 4,
    },
    indicator: {
      flex: 1,
      height: 3,
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      borderRadius: 2,
    },
    activeIndicator: { backgroundColor: "white" },

    gradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "60%", // Taller gradient for better text legibility
    },

    cardContent: {
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 60,
      padding: 20,
    },
    verifiedPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: 10,
    },
    verifiedText: {
      fontSize: 9,
      fontWeight: "900",
      color: "white",
      marginLeft: 3,
    },

    // GLASSMORPHISM BADGES
    bio: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.3,
    },

    floatingActions: {
      position: "absolute",
      right: 12,
      bottom: 20,
      alignItems: "center",
      zIndex: 20,
    },

    statusLabel: {
      position: "absolute",
      alignSelf: "center",
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 2,
      zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.7)", // Premium dark glass feel
    },
    nextLabel: {
      bottom: 120, // Positioned near the bottom for "Up" swipe feedback
      borderColor: theme.colors.primary,
    },
    prevLabel: {
      top: 120, // Positioned near the top for "Down" swipe feedback
      borderColor: theme.colors.primary,
    },
    statusLabelText: {
      fontSize: 18,
      fontWeight: "900",
      color: "white",
      letterSpacing: 3, // Wide spacing for pro look
    },
    nameAgeRow: {
      flexDirection: "row",
      alignItems: "center", // Perfectly centers the Pill with the Text
      marginBottom: 10,
      flexWrap: "wrap", // Prevents overflow if name is long
    },
    name: {
      fontSize: 22,
      fontWeight: "800",
      color: "white",
      letterSpacing: 0.5,
    },
    age: {
      fontSize: 20,
      color: "rgba(255,255,255,0.9)",
      marginHorizontal: 8,
    },
    readyPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      // No more far-right positioning
    },
    readyPillText: {
      fontSize: 9,
      fontWeight: "900",
      color: "white",
      marginLeft: 4,
      letterSpacing: 0.5,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 10,
    },
    glassBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    badgeText: {
      color: "white",
      fontSize: 11,
      fontWeight: "600",
      marginLeft: 6,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      opacity: 0.9,
    },
    infoText: {
      color: "white",
      fontSize: 13,
      marginLeft: 8,
      fontWeight: "500",
    },
  });
