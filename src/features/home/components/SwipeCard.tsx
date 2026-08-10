import React, { useState } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  IdCard,
} from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Profile } from "../../../types/profile";
import { formatDOB } from "../../../utils/dateUtils";
import { ActionButtons } from "../components/ActionButtons";
import { useButtonActions } from "../hooks/useButtonActions";
import { useTranslation } from "react-i18next";
import { getDisplayValue } from "@/features/utils/profileLookups";

const { width: screenWidth } = Dimensions.get("window");

interface SwipeCardProps {
  profile: Profile;
  index: number;
  scrollY: SharedValue<number>;
  itemFullSize: number;
  itemSize: number;
  spacing: number;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  index,
  scrollY,
  itemSize,
  spacing,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      //   Extrapolation.CLAMP,
    );

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.92, 1, 0.92],
      //   Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const cardWidth = screenWidth - spacing * 2; // Dynamically accounts for outer vertical list boundaries
    const photoIndex = Math.round(
      event.nativeEvent.contentOffset.x / cardWidth,
    );
    setActiveIndex(photoIndex);
  };

  const { handleActionBtnTap } = useButtonActions(profile);

  if (!theme) return null;
  return (
    <Animated.View
      style={[
        styles.card,
        cardAnimatedStyle,
        { height: itemSize, marginTop: index === 0 ? spacing : 0 },
      ]}
    >
      <View style={styles.imageContainer}>
        <FlatList
          data={profile?.photos || [null]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.slideFrame}>
              <Image
                source={
                  item?.downloadURL
                    ? { uri: item.downloadURL }
                    : require("../../../../assets/images/profile.webp")
                }
                placeholder={require("../../../../assets/images/profile.webp")}
                placeholderContentFit="cover"
                style={styles.image}
                contentFit="cover"
                cachePolicy="disk"
                transition={200}
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
          {/* Wrap Name to enforce maximum boundary checks */}
          <View style={styles.nameWrapper}>
            <Text style={styles.name} numberOfLines={1}>
              {`${profile?.fn || ""} ${profile?.ln || ""}`.trim() ||
                "User Name"}
            </Text>
          </View>

          <Text style={styles.age}>{formatDOB(profile?.db, "age")}</Text>

          {/* Pill Container automatically lines up */}
          <View
            style={[
              styles.readyPill,
              {
                backgroundColor: `${theme.colors.primary}12`,
              },
            ]}
          >
            <Sparkles size={10} color="white" />
            <Text style={styles.readyPillText}>
              {profile?.ir === "Ready" ? t("card.ready") : t("card.studying")}
            </Text>
          </View>
        </View>

        {/* GLASSMORPHISM BADGES */}
        <View style={styles.badgeRow}>
          {/* OCCUPATION BADGE */}
          {typeof profile?.oc === "number" && profile.oc > 0 && (
            <View style={styles.glassBadge}>
              <Briefcase size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.badgeText}>
                {getDisplayValue("oc", profile.oc)}
              </Text>
            </View>
          )}
          {/* FIELD OF STUDY BADGE */}
          {typeof profile?.fs === "number" && profile.fs > 0 && (
            <View style={styles.glassBadge}>
              <GraduationCap size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.badgeText}>
                {getDisplayValue("fs", profile.fs)}
              </Text>
            </View>
          )}
        </View>
        {/* PARALLEL GLASS BADGES (CITY) */}
        <View style={styles.badgeRow}>
          {!!profile?.cc && (
            <View style={styles.glassBadge}>
              <MapPin size={12} color="white" />
              <Text style={styles.badgeText}>
                {getDisplayValue("ct" as any, profile.cc)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.badgeRow}>
          {profile?.pid && (
            <View style={styles.glassBadge}>
              <IdCard size={12} color="white" />
              <Text style={styles.badgeText}>{profile.pid}</Text>
            </View>
          )}
        </View>
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
      {/* PREMIUM/BASIC BANNER */}
      {(profile?.tier === "basic" || profile?.tier === "premium") && (
        <View
          style={[
            styles.premiumBanner,
            {
              backgroundColor:
                profile?.tier === "premium"
                  ? theme.colors.primary
                  : theme.colors.textLight, // Semi-transparent for basic users
            },
          ]}
        >
          <Text style={styles.premiumText}>
            {profile?.tier === "premium" ? "PREMIUM" : "BASIC"}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      width: screenWidth - 12 * 2,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: "hidden",
      alignSelf: "center",
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
      bottom: 0,
      left: 0,
      right: 60,
      padding: 20,
    },
    floatingActions: {
      position: "absolute",
      right: 12,
      bottom: 20,
      alignItems: "center",
      zIndex: 20,
    },
    nameAgeRow: {
      flexDirection: "row",
      alignItems: "baseline", // Perfectly centers the Pill with the Text
      marginBottom: 10,
      gap: 6,
    },
    nameWrapper: {
      maxWidth: "55%", // Guarantees the name clips nicely if it is very long
    },
    name: {
      fontSize: theme.fontSize.lg,
      fontWeight: "800",
      color: "white",
      letterSpacing: 0.5,
    },
    age: {
      fontSize: theme.fontSize.xs,
      fontWeight: "500",
      color: "rgba(255,255,255,0.9)",
    },
    readyPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "center",
      // No more far-right positioning
    },
    readyPillText: {
      fontSize: theme.fontSize.xs,
      fontWeight: "500",
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
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    badgeText: {
      color: "white",
      fontSize: theme.fontSize.xs,
      fontWeight: "400",
      marginLeft: 6,
    },
    premiumBanner: {
      position: "absolute",
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    premiumText: {
      color: "white",
      fontSize: theme.fontSize.xs,
      fontWeight: "bold",
      letterSpacing: 1.5,
    },
  });
