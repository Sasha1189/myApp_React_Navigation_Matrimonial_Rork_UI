import { useRef } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";

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

  return {
    triggerTabChange,
  };
}
