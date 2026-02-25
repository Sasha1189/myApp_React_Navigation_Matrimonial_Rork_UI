import React, { useState, useRef, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { theme } from "../../../theme/index";
import { useMessageInbox } from "../hooks/useMessageInbox";
import {
  useLikesReceivedProfilesList,
  useLikesSentProfilesList,
} from "../hooks/useLikesProfileData";
import { TabButton } from "../components/TabButton";
import { EmptyState } from "../components/EmptyState";
import { UserBanner } from "../components/UserBanner";
import { ChatBanner } from "../components/ChatBanner";
import { ChatListHelper } from "../components/ChatListHelper";

export default function MessagesScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const gender = user?.displayName;
  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );
  const flatListRef = useRef<FlatList>(null);

  const {
    banners: chatBanners,
    isLive,
    hasNewAtTop,
    loadMore,
    isFetchingMore,
    hasMore,
    reset,
    isLoading: chatsLoading,
  } = useMessageInbox(uid!);
  const { data: likesSent, isLoading: sentLoading } = useLikesSentProfilesList(
    uid!,
  );
  const { data: likesReceived, isLoading: receivedLoading } =
    useLikesReceivedProfilesList(uid!, gender!);

  const helper = ChatListHelper({
    isLive,
    hasMore,
    theme,
    mode: "inbox",
    isLoadingMore: isFetchingMore,
    hasNewContent: hasNewAtTop,
    onLoadMore: loadMore,
    onReset: () => {
      reset();
      flatListRef.current?.scrollToOffset({ offset: 0 });
    },
  });

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
      loading = receivedLoading;
    }

    return { currentData: data, isLoadingState: loading };
  }, [activeTab, chatBanners, chatsLoading]);

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
          label="Sent"
          icon={Send}
          isActive={activeTab === "sent"}
          onPress={() => setActiveTab("sent")}
        />
        <TabButton
          tab="received"
          label="Received"
          icon={Heart}
          isActive={activeTab === "received"}
          onPress={() => setActiveTab("received")}
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
        <View style={{ flex: 1 }}>
          <FlatList
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
            ListFooterComponent={
              activeTab === "chats" ? helper.renderFooter : null
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
          {activeTab === "chats" && helper.renderFloating()}
        </View>
      )}
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
