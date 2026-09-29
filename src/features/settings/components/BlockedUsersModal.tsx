import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Profile } from "@/features/profile/types/profile";
import { useAuth } from "@/context/AuthContext";
import { useBlockedList } from "@/features/block/hook/useBlockedProfilesList";
import { toggleBlock } from "@/features/block/services/blocksService";
import { resolvePhotoUri } from "@/utils/photoUtils";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({ visible, onClose }: Props) {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const { profiles, isLoading } = useBlockedList(user?.uid || "");

  const renderInitials = (name: string) => {
    const safeName = name || "";
    const parts = safeName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || "Username";
  };

  const Item = ({ item }: { item: Profile }) => {
    const Uid = item?.uid;
    const photo = item?.tn;
    const imageUri = resolvePhotoUri(photo ?? undefined, Uid) || "";
    return (
      <View style={styles.row}>
        <View style={styles.left}>
          {item?.tn ? (
            <Image
              source={{ uri: imageUri }}
              placeholder={require("../../../../assets/images/profile.webp")}
              style={styles.avatarImg}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {renderInitials(item?.fn)}
              </Text>
            </View>
          )}
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {item?.fn}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => toggleBlock(user?.uid!, item.uid)}
          style={({ pressed }) => [
            styles.unblockBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.unblockText}>{t("settings.unblock")}</Text>
        </Pressable>
      </View>
    );
  };

  if (!theme) return null;
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
            <Text style={styles.title}>{t("settings.blockedTitle")}</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Banner like chat list */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{t("settings.bannerTitle")}</Text>
            <Text style={styles.bannerSub}>{t("settings.bannerSub")}</Text>
          </View>

          {/* List */}
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
            </View>
          ) : profiles?.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>{t("settings.noBlocked")}</Text>
              <Text style={styles.emptySub}>{t("settings.noBlockedSub")}</Text>
            </View>
          ) : (
            <FlatList
              data={profiles}
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

const AVATAR_SIZE = 34;

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
      marginBottom: 52,
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
    emptyTitle: {
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 4,
    },
    emptySub: { color: theme.colors.textLight },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
