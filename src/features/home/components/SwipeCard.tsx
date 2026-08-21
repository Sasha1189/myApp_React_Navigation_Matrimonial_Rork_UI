import React, { useState, useCallback, useMemo } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
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
import { resolvePhotoUri } from "@/utils/photoUtils";

const { width: screenWidth } = Dimensions.get("window");

interface SwipeCardProps {
  profile: Profile;
  index: number;
  scrollY: SharedValue<number>;
  itemFullSize: number;
  itemSize: number;
  spacing: number;
}

// -----------------------------------------------------------------------------
// 1. ISOLATED PHOTO GALLERY (Contains photo activeIndex state to avoid card re-renders)
// -----------------------------------------------------------------------------
interface PhotoGalleryProps {
  photos?: any[];
  profileUid: string;
  cardWidth: number;
  styles: ReturnType<typeof createStyles>;
}

const CardPhotoGalleryComponent: React.FC<PhotoGalleryProps> = ({
  photos,
  profileUid,
  cardWidth,
  styles,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const photoIndex = Math.round(
        event.nativeEvent.contentOffset.x / cardWidth,
      );
      if (photoIndex !== activeIndex) {
        setActiveIndex(photoIndex);
      }
    },
    [cardWidth, activeIndex],
  );

  const getItemLayout = useCallback(
    (_: any, idx: number) => ({
      length: cardWidth,
      offset: cardWidth * idx,
      index: idx,
    }),
    [cardWidth],
  );

  const keyExtractor = useCallback(
    (item: any, idx: number) =>
      item?.downloadURL || `${profileUid}-photo-${idx}`,
    [profileUid],
  );

  const renderPhotoItem = useCallback(
    ({ item }: { item: any }) => {
      const imageUri = resolvePhotoUri(item?.downloadURL, profileUid) || "";
      return (
        <View style={[styles.slideFrame, { width: cardWidth }]}>
          <Image
            source={{ uri: imageUri }}
            placeholder={require("../../../../assets/images/profile.webp")}
            placeholderContentFit="cover"
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            recyclingKey={imageUri}
          />
        </View>
      );
    },
    [cardWidth, profileUid, styles],
  );

  const photoList = photos && photos.length > 0 ? photos : [null];

  return (
    <>
      <View style={styles.imageContainer}>
        <FlatList
          data={photoList}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={renderPhotoItem}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          removeClippedSubviews={Platform.OS === "android"}
          decelerationRate="fast"
          snapToInterval={cardWidth}
          snapToAlignment="center"
        />
      </View>

      <View style={styles.imageIndicators}>
        {photoList.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicator,
              idx === activeIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </>
  );
};

const CardPhotoGallery = React.memo(
  CardPhotoGalleryComponent,
  (prev, next) =>
    prev.photos === next.photos &&
    prev.profileUid === next.profileUid &&
    prev.cardWidth === next.cardWidth,
);

// -----------------------------------------------------------------------------
// 2. ISOLATED CARD DETAILS (Memoized static content & badges)
// -----------------------------------------------------------------------------
interface CardDetailsProps {
  profile: Profile;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}

const CardDetailsComponent: React.FC<CardDetailsProps> = ({
  profile,
  styles,
  theme,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.cardContent} pointerEvents="box-none">
      <View style={styles.nameAgeRow}>
        <View style={styles.nameWrapper}>
          <Text style={styles.name} numberOfLines={1}>
            {`${profile?.fn || ""} ${profile?.ln || ""}`.trim() || "User Name"}
          </Text>
        </View>

        <Text style={styles.age}>{formatDOB(profile?.db, "age")}</Text>

        <View
          style={[
            styles.readyPill,
            { backgroundColor: `${theme.colors.primary}12` },
          ]}
        >
          <Sparkles size={10} color="white" />
          <Text style={styles.readyPillText}>
            {profile?.ir === "Ready" ? t("card.ready") : t("card.studying")}
          </Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        {typeof profile?.oc === "number" && profile.oc > 0 && (
          <View style={styles.glassBadge}>
            <Briefcase size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.badgeText}>
              {getDisplayValue("oc", profile.oc)}
            </Text>
          </View>
        )}
        {typeof profile?.fs === "number" && profile.fs > 0 && (
          <View style={styles.glassBadge}>
            <GraduationCap size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.badgeText}>
              {getDisplayValue("fs", profile.fs)}
            </Text>
          </View>
        )}
      </View>

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
        {!!profile?.pid && (
          <View style={styles.glassBadge}>
            <IdCard size={12} color="white" />
            <Text style={styles.badgeText}>{profile.pid}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const CardDetails = React.memo(
  CardDetailsComponent,
  (prev, next) =>
    prev.profile.uid === next.profile.uid &&
    prev.profile.fn === next.profile.fn &&
    prev.profile.ln === next.profile.ln &&
    prev.profile.db === next.profile.db &&
    prev.profile.ir === next.profile.ir &&
    prev.profile.oc === next.profile.oc &&
    prev.profile.fs === next.profile.fs &&
    prev.profile.cc === next.profile.cc &&
    prev.profile.pid === next.profile.pid,
);

// -----------------------------------------------------------------------------
// 3. MAIN SWIPE CARD COMPONENT
// -----------------------------------------------------------------------------
const SwipeCardComponent: React.FC<SwipeCardProps> = ({
  profile,
  index,
  scrollY,
  itemSize,
  spacing,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { handleActionBtnTap } = useButtonActions(profile);

  const cardWidth = useMemo(() => screenWidth - spacing * 2, [spacing]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const opacity = interpolate(scrollY.value, inputRange, [0.5, 1, 0.5]);
    const scale = interpolate(scrollY.value, inputRange, [0.92, 1, 0.92]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handleLike = useCallback(
    () => handleActionBtnTap("like"),
    [handleActionBtnTap],
  );
  const handleMessage = useCallback(
    () => handleActionBtnTap("message"),
    [handleActionBtnTap],
  );
  const handleProfileDetails = useCallback(
    () => handleActionBtnTap("profileDetails"),
    [handleActionBtnTap],
  );

  if (!theme) return null;

  return (
    <Animated.View
      style={[
        styles.card,
        cardAnimatedStyle,
        { height: itemSize, marginTop: index === 0 ? spacing : 0 },
      ]}
    >
      <CardPhotoGallery
        photos={profile?.photos}
        profileUid={profile.uid}
        cardWidth={cardWidth}
        styles={styles}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <CardDetails profile={profile} styles={styles} theme={theme} />

      <View style={styles.floatingActions}>
        <ActionButtons
          onLike={handleLike}
          onMessage={handleMessage}
          onProfileDetails={handleProfileDetails}
          liked={profile?.liked}
        />
      </View>

      {(profile?.tier === "basic" || profile?.tier === "premium") && (
        <View
          style={[
            styles.premiumBanner,
            {
              backgroundColor:
                profile?.tier === "premium"
                  ? theme.colors.primary
                  : theme.colors.textLight,
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

export const SwipeCard = React.memo(
  SwipeCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.profile.uid === nextProps.profile.uid &&
      prevProps.profile.liked === nextProps.profile.liked &&
      prevProps.profile.tier === nextProps.profile.tier &&
      prevProps.profile.photos === nextProps.profile.photos &&
      prevProps.index === nextProps.index &&
      prevProps.itemSize === nextProps.itemSize &&
      prevProps.spacing === nextProps.spacing &&
      prevProps.scrollY === nextProps.scrollY
    );
  },
);

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

    imageIndicators: {
      position: "absolute",
      bottom: 12,
      left: 20,
      right: 20,
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
      height: "60%",
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
      alignItems: "baseline",
      marginBottom: 10,
      gap: 6,
    },
    nameWrapper: {
      maxWidth: "55%",
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
