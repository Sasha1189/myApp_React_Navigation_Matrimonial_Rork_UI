import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../constants/theme";
import { Profile } from "../../../types/profile";

const { width: screenWidth } = Dimensions.get("window");

interface ProfileCarouselProps {
  profile: Profile;
}

export const ProfileCarousel: React.FC<ProfileCarouselProps> = ({
  profile,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.imageContainer}>
      {profile?.photos && profile?.photos.length > 0 ? (
        <>
          <FlatList
            data={profile.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View
                style={{
                  width: screenWidth - theme.spacing.lg * 2,
                  height: "100%",
                }}
              >
                <Image
                  source={
                    item?.downloadURL
                      ? { uri: item.downloadURL }
                      : require("../../../../assets/images/profile.png")
                  }
                  style={styles.profileImage}
                  contentFit={item?.downloadURL ? "cover" : "contain"}
                  cachePolicy="disk"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={styles.imageGradient}
                  pointerEvents="none"
                />
              </View>
            )}
            onScroll={onScroll}
            scrollEventThrottle={16}
          />

          {/* Indicators */}
          <View style={styles.imageIndicators}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === activeIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        </>
      ) : (
        <View
          style={[
            styles.profileImage,
            { backgroundColor: theme.colors.border },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden", // important for rounded edges!
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 10,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
  activeIndicator: {
    backgroundColor: "white",
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
  },
});
