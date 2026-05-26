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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function MessagesScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user, tier } = useAuth();
  const { t } = useTranslation();

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
    tier,
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
      data = chatBanners || [];
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
    chatBanners,
    chatsLoading,
    likesSent,
    sentLoading,
    likesReceived,
    recLoading,
  ]);

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

      {/* 2. RHF Style Section Title */}
      <View style={styles.titleWrapper}>
        <Text style={styles.sectionTitle}>{t("chat.recentActivity")}</Text>
        <View style={styles.titleUnderline} />
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
            {...panHandlers}
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
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    titleWrapper: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.fontSize.xs, // Small and sophisticated
      fontWeight: "800",
      color: theme.colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    titleUnderline: {
      height: 2,
      width: 24,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
      borderRadius: 1,
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
