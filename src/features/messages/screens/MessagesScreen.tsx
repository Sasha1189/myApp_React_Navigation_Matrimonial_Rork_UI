import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
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

export default function MessagesScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [activeTab, setActiveTab] = useState<"chats" | "sent" | "received">(
    "chats",
  );

  const { banners: chatBanners, isLoading: chatsLoading } = useMessageInbox(
    uid!,
  );
  console.log("Chat Bannersss:", chatBanners.length);
  // Simple Data Selection
  const currentData = activeTab === "chats" ? chatBanners : []; // Add likesSent/received logic back here later
  const isLoading = activeTab === "chats" ? chatsLoading : false;

  // const { data: sent = [], isLoading: sentLoading } = useLikesSentProfilesList(
  //   uid!,
  // );
  // console.log("Sent Likes:", sent.length);

  // const { data: received = [], isLoading: receivedLoading } =
  //   useLikesReceivedProfilesList(uid!, gender as any);
  // console.log("Received Likes:", received.length);

  // 🔹 FIX 3: Memoize the data selection to prevent FlatList from flickering
  // const { currentData, isLoading } = useMemo(() => {
  //   let data: any[] = [];
  //   let loading = false;

  //   if (activeTab === "chats") {
  //     data = chatBanners;
  //     loading = chatsLoading;
  //   }
  //   // } else if (activeTab === "sent") {
  //   //   data = sent;
  //   //   loading = sentLoading;
  //   // } else {
  //   //   data = received;
  //   //   loading = receivedLoading;
  //   // }
  //   return { currentData: data, isLoading: loading };
  // }, [
  //   activeTab,
  //   chatBanners,
  //   chatsLoading,
  //   // sent,
  //   // sentLoading,
  //   // received,
  //   // receivedLoading,
  // ]);

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

      {isLoading && currentData.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text>Loading...</Text>
        </View>
      ) : currentData.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <FlatList
          data={currentData as any[]}
          keyExtractor={(item) =>
            (item as any).roomId || (item as any).uid || (item as any).id
          }
          renderItem={({ item }) => {
            if (activeTab === "chats") {
              return uid ? <ChatBanner item={item} uid={uid} /> : null;
            }
            return <UserBanner item={item} type={activeTab} />;
          }}
          contentContainerStyle={styles.activityContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          removeClippedSubviews={true}
          // maxToRenderPerBatch={10}
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
