import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { useToggleLike } from "./useSwipeMutations";

export function useFeedActions(uid: string, profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const toggleLikeMutation = useToggleLike(uid);

  const handleActionBtnTap = (action: "like" | "message" | "profileDetails") => {
    if (!profile) return;
    const profileId = profile.uid;

    if (action === "like") {
      toggleLikeMutation.mutate(profileId);
    }
    if (action === "message") {
      navigation.navigate("Chat", { otherUserId: profileId });
    }
    if (action === "profileDetails") {
      navigation.navigate("Details", { profile });
    }
  };

  return { handleActionBtnTap };
}