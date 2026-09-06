import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useMessageInbox } from "../hooks/useMessageInbox";
import { useTabSwipe } from "../hooks/useTabSwipe";
import { TabButton } from "../components/TabButton";
import { EmptyState } from "../components/EmptyState";
import { LikedUserBanner } from "../components/LikedUserBanner";
import { MessageBanner } from "../components/MessageBanner";
import { ChatFooter } from "../components/ChatFooter";
import { ChatFloatingUI } from "@/features/messages/components/ChatFloatingUI";
import { useTranslation } from "react-i18next";
import {
  useLikeSent,
  useLikeReceived,
} from "@/features/likes/hook/useLikedReceivedProfilesList";
import { IInboxItem } from "../type/chattype";
import { useProfileStats } from "@/features/profile/hooks/useProfileStats";

export default function MessagesScreen() {
  const { user, tier } = useAuth();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );
  const uid = user?.uid;
  const safeUid = uid ?? "";
  //....
  const {
    banners: messageBanners,
    isLive,
    hasNewAtTop,
    loadMore,
    isFetchingMore,
    hasMore,
    reset,
    isLoading: chatsLoading,
  } = useMessageInbox(safeUid);

  const { profiles: likesSent, isLoading: sentLoading } = useLikeSent(safeUid);

  const { profiles: likesReceived, isLoading: recLoading } = useLikeReceived(
    safeUid,
    tier,
  );
  console.log("[message screen - likesReceived length]-", likesReceived.length);

  const { triggerTabChange } = useTabSwipe(activeTab, setActiveTab);
  const flatListRef = useRef<FlatList>(null);

  const { currentData, isLoadingState } = useMemo(() => {
    let data: any[] = [];
    let loading = false;

    if (activeTab === "chats") {
      data = messageBanners || [];
      loading = chatsLoading;
    } else if (activeTab === "sent") {
      data = likesSent || [];
      loading = sentLoading;
    } else if (activeTab === "received") {
      data = likesReceived || [];
      loading = recLoading;
    }

    return { currentData: data, isLoadingState: loading };
  }, [
    activeTab,
    messageBanners,
    chatsLoading,
    likesSent,
    sentLoading,
    likesReceived,
    recLoading,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (activeTab === "chats") {
        return <MessageBanner item={item as IInboxItem} uid={user?.uid!} />;
      }
      return <LikedUserBanner item={item} type={activeTab} />;
    },
    [activeTab, user?.uid],
  );

  const keyExtractor = useCallback((item: any) => item.roomId || item.uid, []);

  if (!theme) return null;

  return (
    <View style={styles.container}>
      {/* 1. Refined Tab Section */}
      <View style={styles.headerWrapper}>
        <View style={styles.tabsContainer}>
          <TabButton
            tab="chats"
            label={t("chat.tabs.chats")}
            icon={MessageCircle}
            isActive={activeTab === "chats"}
            onPress={() => triggerTabChange("chats")}
          />
          <TabButton
            tab="sent"
            label={t("chat.tabs.sent")}
            icon={Send}
            isActive={activeTab === "sent"}
            onPress={() => triggerTabChange("sent")}
          />
          <TabButton
            tab="received"
            label={t("chat.tabs.received")}
            icon={Heart}
            isActive={activeTab === "received"}
            onPress={() => triggerTabChange("received")}
          />
        </View>
      </View>

      {isLoadingState && currentData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      ) : currentData.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            key={activeTab}
            ref={flatListRef}
            data={currentData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              activeTab === "chats" ? (
                <ChatFooter
                  hasMore={hasMore}
                  isLoadingMore={isFetchingMore}
                  onLoadMore={loadMore}
                  mode="inbox"
                />
              ) : (
                <View style={{ height: 40 }} />
              )
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
    },
    headerWrapper: {
      backgroundColor: theme.colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingTop: 0,
    },
    tabsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingBottom: theme.spacing.sm,
    },

    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: 120, // Space for floating buttons/tabs
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
