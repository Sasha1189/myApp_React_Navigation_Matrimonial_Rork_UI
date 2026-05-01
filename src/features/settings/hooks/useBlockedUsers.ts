import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { BlocksCache } from "@/cache/cacheConfig";
import { unblockUser } from "@/features/profile/api/blockApi";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { firestore, doc, getDocFromCache } from "@/config/firebase";

export const useBlockedUsers = () => {
  const { user } = useAuth(); // 🔹 Get targetCollection
  const { t } = useTranslation();

  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // 🔹 Add loading state

  useEffect(() => {
    const hydrateList = async () => {
      if (!user?.uid || !user?.displayName) return;

      const gender = user?.displayName.toLowerCase();

      if (gender !== "male" && gender !== "female") return;

      const targetCollection =
        gender === "male" ? "femaleProfiles" : "maleProfiles";

      setLoading(true);

      // 1. 🔹 READ FROM MMKV (Instant, $0 cost)
      const myBlockedIds = BlocksCache.getMyIds();

      if (myBlockedIds.length === 0) {
        setBlockedList([]);
        setLoading(false);
        return;
      }

      // 2. Hydrate Names/Photos from Local Cache
      const profiles = await Promise.all(
        myBlockedIds.map(async (id) => {
          try {
            const ref = doc(firestore, targetCollection, id);
            // Try cache first
            const snap = await getDocFromCache(ref).catch(() => null);

            if (snap && snap.exists()) {
              const data = snap.data();
              return {
                uid: id,
                fullName:
                  data?.fullName || data?.displayName || t("common.user"),
                thumbnail: data?.thumbnail || data?.photo || "",
              };
            }
          } catch (e) {
            console.log("Profile hydration skipped for:", id);
          }
          return {
            uid: id,
            fullName: t("common.blockedUser"),
            thumbnail: "",
          };
        }),
      );

      setBlockedList(profiles);
      setLoading(false);
    };

    hydrateList();
  }, [user?.uid, user?.displayName]);

  const handleUnblock = async (targetUser: any) => {
    if (loading || !user?.uid) return;

    Alert.alert(
      t("details.actions.unblock"),
      `${t("alerts.unblockConfirm", "Unblock")} ${targetUser.fullName}?`,
      [
        { text: t("alerts.cancel"), style: "cancel" },
        {
          text: t("details.actions.unblock"),
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Database Write (Updates 'mine' and 'theirs')
              await unblockUser(user.uid, targetUser.uid);

              // 2. Update Local MMKV (Remove from feed filter)
              BlocksCache.update(targetUser.uid, "remove");

              // 3. Optimistic UI Update
              setBlockedList((prev) =>
                prev.filter((p) => p.uid !== targetUser.uid),
              );

              Alert.alert(t("common.success"), t("alerts.unblockSuccess"));
            } catch (error) {
              console.error("Unblock Error:", error);
              Alert.alert(t("common.error"), t("alerts.unblockError"));
            }
          },
        },
      ],
    );
  };

  return {
    blockedList,
    handleUnblock,
    loading,
  };
};
