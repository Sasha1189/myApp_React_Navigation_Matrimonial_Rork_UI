import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { theme } from "../../../theme/index";
import { TabButton } from "../components/TabButton";
import { EmptyState } from "../components/EmptyState";
import { UserBanner } from "../components/UserBanner";
import { useMessagesData } from "../hooks/useMessagesData";

export default function MessagesScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );

  const { data, loading } = useMessagesData(activeTab, uid);

  return (
    <LinearGradient
      colors={[theme.colors.background, "white"]}
      style={styles.container}
    >
      <View style={styles.tabsContainer}>
        <TabButton
          tab="chats"
          label="Chats"
          icon={MessageCircle}
          isActive={activeTab === "chats"}
          onPress={() => setActiveTab("chats")}
        />
        <TabButton
          tab="sent"
          label="Likes Sent"
          icon={Send}
          isActive={activeTab === "sent"}
          onPress={() => setActiveTab("sent")}
        />
        <TabButton
          tab="received"
          label="Likes Received"
          icon={Heart}
          isActive={activeTab === "received"}
          onPress={() => setActiveTab("received")}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : data?.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserBanner item={item} type={activeTab} />}
          contentContainerStyle={styles.activityContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          removeClippedSubviews
          maxToRenderPerBatch={15}
          windowSize={5}
        />
      )}
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
