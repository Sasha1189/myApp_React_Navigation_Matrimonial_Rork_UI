import { useRef } from "react";
import {
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = "chats" | "sent" | "received";

export function useTabSwipe(
  currentTab: TabType,
  setTab: (tab: TabType) => void,
) {
  const tabs: TabType[] = ["chats", "sent", "received"];

  const triggerTabChange = (nextTab: TabType) => {
    // Smooth transition for the switch
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(nextTab);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        // Only trigger if horizontal movement is more than vertical
        return Math.abs(dx) > 35 && Math.abs(dy) < 25;
      },
      onPanResponderRelease: (_, { dx }) => {
        const currentIndex = tabs.indexOf(currentTab);

        // 👈 SWIPE LEFT (Finger moves right -> left) = GO TO NEXT TAB
        if (dx < -60) {
          if (currentTab === "chats") triggerTabChange("sent");
          else if (currentTab === "sent") triggerTabChange("received");
        }

        // 👉 SWIPE RIGHT (Finger moves left -> right) = GO TO PREVIOUS TAB
        else if (dx > 60) {
          if (currentTab === "received") triggerTabChange("sent");
          else if (currentTab === "sent") triggerTabChange("chats");
        }
      },
    }),
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    triggerTabChange,
  };
}
