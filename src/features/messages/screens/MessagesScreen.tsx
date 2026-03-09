import React, { useState, useRef, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useMessageInbox } from "../hooks/useMessageInbox";
import { useLikeSent, useLikeReceived } from "../hooks/useLikesList";
import { useTabSwipe } from "../hooks/useTabSwipe";
import { TabButton } from "../components/TabButton";
import { EmptyState } from "../components/EmptyState";
import { UserBanner } from "../components/UserBanner";
import { ChatBanner } from "../components/ChatBanner";
import { ChatFooter } from "../components/ChatFooter";
import { ChatFloatingUI } from "@/features/messages/components/ChatFloatingUI";

export default function MessagesScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user } = useAuth();

  const uid = user?.uid;
  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );

  const {
    banners: chatBanners,
    isLive,
    hasNewAtTop,
    loadMore,
    isFetchingMore,
    hasMore,
    reset,
    isLoading: chatsLoading,
  } = useMessageInbox(uid || "");
  const { data: likesSent, isLoading: sentLoading } = useLikeSent(uid || "");
  const { data: likesReceived, isLoading: recLoading } = useLikeReceived(
    uid || "",
  );

  const { panHandlers, triggerTabChange } = useTabSwipe(
    activeTab,
    setActiveTab,
  );
  const flatListRef = useRef<FlatList>(null);

  const { currentData, isLoadingState } = useMemo(() => {
    let data: any[] = [];
    let loading = false;

    if (activeTab === "chats") {
      data = chatBanners;
      loading = chatsLoading;
    } else if (activeTab === "sent") {
      data = likesSent;
      loading = sentLoading;
    } else {
      data = likesReceived!;
      loading = recLoading;
    }

    return { currentData: data, isLoadingState: loading };
  }, [activeTab, chatBanners, chatsLoading]);

  if (!theme) return null;

  return (
    <View style={styles.container} {...panHandlers}>
      <View style={styles.tabsContainer}>
        <TabButton
          tab="chats"
          label="Chats"
          icon={MessageCircle}
          isActive={activeTab === "chats"}
          onPress={() => triggerTabChange("chats")}
        />
        <TabButton
          tab="sent"
          label="Sent"
          icon={Send}
          isActive={activeTab === "sent"}
          onPress={() => triggerTabChange("sent")}
        />
        <TabButton
          tab="received"
          label="Received"
          icon={Heart}
          isActive={activeTab === "received"}
          onPress={() => triggerTabChange("received")}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>

      {isLoadingState && currentData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : currentData.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <FlatList
            key={activeTab}
            ref={flatListRef}
            data={currentData}
            keyExtractor={(item) => item.roomId || item.uid || item.id}
            renderItem={({ item }) =>
              activeTab === "chats" ? (
                <ChatBanner item={item} uid={uid!} />
              ) : (
                <UserBanner item={item} type={activeTab} />
              )
            }
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListFooterComponent={
              activeTab === "chats" ? (
                <ChatFooter
                  hasMore={hasMore}
                  isLoadingMore={isFetchingMore}
                  onLoadMore={loadMore}
                  mode="inbox"
                />
              ) : null
            }
          />
          {activeTab === "chats" && (
            <ChatFloatingUI
              isLive={isLive}
              hasNewContent={hasNewAtTop}
              onReset={reset}
              mode="inbox"
            />
          )}
        </View>
      )}
    </View>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: theme.spacing.xl,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    footerContainer: {
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    noMoreText: {
      color: theme.colors.textLight,
      fontSize: theme.fontSize.sm,
    },
    loadMoreBtn: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
  });
