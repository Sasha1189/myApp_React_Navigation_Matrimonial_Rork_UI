import React, { useState } from "react";
import { useAppNavigation } from "../../../navigation/hooks";
import { Profile } from "../../../types/profile";
import { toggleLike } from "./useToggleLike";
import { useProfileContext } from "../../../context/ProfileContext";

export function useButtonActions(uid: string, profile: Profile | undefined) {
  const navigation = useAppNavigation();
  const [isLiking, setIsLiking] = useState(false);

  const { profile: myProfile } = useProfileContext();

  const handleActionBtnTap = async (
    action: "like" | "message" | "profileDetails",
  ) => {
    if (!profile || !myProfile) return;

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
          // sender: {
          //   name: myProfile.fullName,
          //   photo: myProfile.thumbnail || "",
          // },
        });
      } catch (err) {
        console.error("Failed to start chat:", err);
      }
    }

    if (action === "like") {
      if (isLiking) return;
      setIsLiking(true);
      console.log("hit like on usefeedaction");

      try {
        await toggleLike(
          {
            myUid: myProfile.uid,
            name: myProfile.fullName,
            photo: myProfile.thumbnail!,
          },
          {
            uid: profile.uid,
            name: profile.fullName || "User",
            photo: profile.thumbnail || "",
          },
        );
      } catch (err) {
        console.error("Like toggle failed:", err);
      } finally {
        setIsLiking(false);
      }
    }

    if (action === "profileDetails") {
      navigation.navigate("Details", { profile });
    }
  };

  return { handleActionBtnTap };
}
