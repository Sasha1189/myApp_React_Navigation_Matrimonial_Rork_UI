import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import {
  ChevronUp,
  MessageSquare,
  WifiOff,
  RefreshCw,
} from "lucide-react-native";
import { rtdb } from "src/config/firebase";

interface ChatHelperProps {
  isLive: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasNewContent: boolean; // For "New Message at Top" or "New Message Below"
  onLoadMore: () => void;
  onReset: () => void;
  mode: "inbox" | "chat"; // Adjusts text/icons for the specific screen
  theme: any;
}

export const ChatListHelper = ({
  isLive,
  hasMore,
  isLoadingMore,
  hasNewContent,
  onLoadMore,
  onReset,
  mode,
  theme,
}: ChatHelperProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-40)).current;

  // 1. Database Connection Listener
  useEffect(() => {
    const connectedRef = rtdb.ref(".info/connected");
    const listener = connectedRef.on("value", (snap) => {
      const offline = snap.val() === false;
      setIsOffline(offline);

      // 🟢 One-liner Animation: Slide down to 0 if offline, else back to -40
      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -40,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return () => connectedRef.off("value", listener);
  }, [slideAnim]);

  const handleRetry = () => {
    // 🟢 Manual Reconnect: Forces RTDB to refresh its socket connection
    rtdb.goOffline();
    rtdb.goOnline();
  };

  const renderOfflineBar = () => (
    <Animated.View
      style={[
        styles.offlineBar,
        {
          backgroundColor: theme.colors.error,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.row}>
        <WifiOff size={14} color="#a80f0f" />
        <Text style={styles.offlineText}>Waiting for network...</Text>
      </View>
      <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
        <RefreshCw size={14} color="#961010" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // 1. Manual "Load More" Button & Loading State (The Footer)
  const renderFooter = () => (
    <View style={styles.footer}>
      {isLoadingMore ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : hasMore ? (
        <TouchableOpacity
          onPress={onLoadMore}
          style={[styles.loadBtn, { borderColor: theme.colors.primary }]}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
            {mode === "inbox" ? "Load Older Chats" : "Load Earlier Messages"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // 2. Floating "Back to Live" / "New Content" UI
  const renderFloating = () => {
    if (isLive) return null; // Don't show floating UI in live mode

    return (
      <View style={styles.floatingContainer}>
        {hasNewContent && (
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: theme.colors.accent }]}
            onPress={onReset}
          >
            <MessageSquare size={16} color="#FFF" />
            <Text style={styles.badgeText}>
              New {mode === "inbox" ? "Chat" : "Message"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={onReset}
        >
          <ChevronUp
            size={24}
            color="#FFF"
            style={mode === "chat" && { transform: [{ rotate: "180deg" }] }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return { renderFooter, renderFloating, renderOfflineBar };
};

const styles = StyleSheet.create({
  offlineBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 35,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  offlineText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },
  retryBtn: { flexDirection: "row", alignItems: "center", padding: 4 },
  retryText: { color: "#FFF", fontSize: 11, marginLeft: 4, fontWeight: "bold" },

  // --- ChatListHelper: Footer (Load More) ---
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 150,
    alignItems: "center",
  },

  // --- ChatListHelper: Floating UI ---
  floatingContainer: {
    position: "absolute",
    bottom: 100, // Adjust based on your ChatInput height
    right: 20,
    alignItems: "flex-end",
    zIndex: 999,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },
});
