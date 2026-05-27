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
  // 🔹 FIX: Use a Ref to keep track of the tab so the Responder isn't "stale"
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const tabs: TabType[] = ["chats", "sent", "received"];

  const triggerTabChange = (nextTab: TabType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(nextTab);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        // Capture if horizontal swipe is intentional (> 30px)
        return Math.abs(dx) > 30 && Math.abs(dy) < 25;
      },
      onPanResponderRelease: (_, { dx }) => {
        const active = currentTabRef.current;
        const currentIndex = tabs.indexOf(active);

        if (dx < -60) {
          // USER SWIPED LEFT (Move to next tab)
          if (active === "chats") triggerTabChange("sent");
          else if (active === "sent") triggerTabChange("received");
        } else if (dx > 60) {
          // USER SWIPED RIGHT (Move to previous tab)
          if (active === "received") triggerTabChange("sent");
          else if (active === "sent") triggerTabChange("chats");
        }
      },
    }),
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    triggerTabChange,
  };
}
