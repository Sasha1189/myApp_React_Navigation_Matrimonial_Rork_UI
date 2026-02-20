import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { useToggleLike } from "./useSwipeMutations";
import { useProfileContext } from "src/context/ProfileContext";

export function useFeedActions(uid: string, profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const toggleLikeMutation = useToggleLike(uid);

  const { profile: myProfile } = useProfileContext();

  const handleActionBtnTap = async (
    action: "like" | "message" | "profileDetails",
  ) => {
    if (!profile) return;
    const profileId = profile.uid;

    if (action === "message") {
      try {
        const roomId = [myProfile.uid, profile.uid].sort().join("_");
        // 2. Navigate to Chat with all necessary RTDB context
        navigation.navigate("Chat", {
          roomId,
          uid: myProfile.uid,
          otherUser: {
            uid: profile.uid,
            name: profile.fullName,
            photo: profile.thumbnail || "",
          },
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
