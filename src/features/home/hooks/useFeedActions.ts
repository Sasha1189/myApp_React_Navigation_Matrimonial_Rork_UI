import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { useToggleLike } from "./useSwipeMutations";
import { createChatRoom } from "../../messages/apis/chatApi";

export function useFeedActions(uid: string, profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const toggleLikeMutation = useToggleLike(uid);

  const handleActionBtnTap = async (
    action: "like" | "message" | "profileDetails",
  ) => {
    if (!profile) return;
    const profileId = profile.uid;

    if (action === "message") {
      try {
        // 1. Create/Get the Room ID in Firestore
        const roomId = await createChatRoom(uid, profile);

        // 2. Navigate to Chat with all necessary RTDB context
        navigation.navigate("Chat", {
          roomId,
          otherUser: {
            uid: profile.uid,
            fullName: profile.fullName,
            thumbnail: profile.thumbnail,
          },
          uid, // Current user ID for 'isMe' checks
        });
      } catch (err) {
        console.error("Failed to start chat:", err);
      }
    }

    if (action === "like") {
      toggleLikeMutation.mutate(profileId);
    }

    if (action === "profileDetails") {
      navigation.navigate("Details", { profile });
    }
  };

  return { handleActionBtnTap };
}
