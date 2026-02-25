import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image"; // Recommended for React Native 0.81

interface ChatHeaderProps {
  name: string;
  photo?: string;
  status: string;
  isTyping: boolean;
  isOnline: boolean;
  theme: any;
}

export const ChatHeader = ({
  name,
  photo,
  status,
  isTyping,
  isOnline,
  theme,
}: ChatHeaderProps) => (
  <TouchableOpacity style={styles.headerContainer} activeOpacity={0.7}>
    <Image
      source={
        photo
          ? { uri: photo }
          : require("../../../../assets/images/profile.png")
      }
      style={styles.headerAvatar}
      cachePolicy="disk"
    />
    <View style={styles.textContainer}>
      <Text style={styles.headerName} numberOfLines={1}>
        {name || "Chat"}
      </Text>
      {status ? (
        <Text
          style={[
            styles.headerStatus,
            (isTyping || isOnline) && { color: theme.colors.textLight },
          ]}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  textContainer: { justifyContent: "center" },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerName: { fontSize: 16, fontWeight: "600" },
  headerStatus: { fontSize: 12, color: "gray" },
});
