import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { theme } from "../../../constants/theme";
import { UserBannerItem } from "../type/chattype";
import { useAppNavigation } from "../../../navigation/hooks";

interface UserBannerProps {
  item: UserBannerItem;
  type: "sent" | "received";
}

export const UserBanner: React.FC<UserBannerProps> = ({ item, type }) => {
  const navigation = useAppNavigation();

  const handlePress = () => {
    if (item.profile) {
      navigation.navigate("Details", {
        profile: item.profile,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.activityCard} onPress={handlePress}>
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require("../../../../assets/images/profile.png")
        }
        style={styles.activityImage}
        contentFit={item.photo ? "cover" : "contain"}
        cachePolicy="disk"
      />
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>
          {item?.name || "Unknown"}, {item?.age || "18+"}
        </Text>
        <Text style={styles.activityText}>
          {type === "sent" ? "You liked this profile ❤️" : "They liked you 💌"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
});
