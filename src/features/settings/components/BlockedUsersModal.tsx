import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { theme } from "../../../theme/index"; // ← adjust path if needed
import { X } from "lucide-react-native";
import { BlockedUserDetail } from "../../../types/profile";

interface Props {
  visible: boolean;
  onClose: () => void;
  users: BlockedUserDetail[];
  onUnblock: (id: string) => void;
}

export default function BlockedUsersModal({
  visible,
  onClose,
  users,
  onUnblock,
}: Props) {
  const renderInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  };

  const Item = ({ item }: { item: BlockedUserDetail }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {renderInitials(item.name)}
            </Text>
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onUnblock(item.uid)}
        style={({ pressed }) => [
          styles.unblockBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={styles.unblockText}>Unblock</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Blocked Users</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Banner like chat list */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>
              People you block can’t contact you
            </Text>
            <Text style={styles.bannerSub}>
              They won’t be able to message or view your profile until you
              unblock them.
            </Text>
          </View>

          {/* List */}
          {users.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No blocked users</Text>
              <Text style={styles.emptySub}>
                You haven’t blocked anyone yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(u) => u.uid}
              renderItem={Item}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 14,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    padding: 6,
    borderRadius: 8,
  },
  banner: {
    backgroundColor: theme.colors.primary + "1A", // light tint
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bannerTitle: { fontWeight: "700", color: theme.colors.text },
  bannerSub: { color: theme.colors.textLight, marginTop: 2, lineHeight: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.colors.background,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.colors.primary + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontWeight: "800",
    color: theme.colors.primary,
  },
  meta: { flex: 1 },
  name: { fontWeight: "700", fontSize: 15, color: theme.colors.text },
  sub: { color: theme.colors.textLight, marginTop: 2 },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unblockText: { fontWeight: "700", color: theme.colors.text },
  sep: { height: 1, backgroundColor: theme.colors.border },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyTitle: { fontWeight: "800", color: theme.colors.text, marginBottom: 4 },
  emptySub: { color: theme.colors.textLight },
});
