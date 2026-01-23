import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { theme } from "../../../theme/index";
import { TabButton } from "../components/TabButton";
import { EmptyState } from "../components/EmptyState";
import { UserBanner } from "../components/UserBanner";
import { type MessagesScreenNavigationProp } from "../type/messages";
import { useMessagesData } from "../hooks/useMessagesData";
import { useRecentChatPartners } from "../hooks/useRecentChatPartners";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );

  useRecentChatPartners(uid);
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
  listContent: {
    paddingTop: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  activeTabText: {
    color: "white",
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
