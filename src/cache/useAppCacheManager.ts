import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { runPruneOnceDaily } from "./cachePrune";

export function useAppCacheManager() {
  useEffect(() => {
    // 1. Run on initial mount (with a slight delay to prioritize UI rendering)
    const initialTimer = setTimeout(() => {
      runPruneOnceDaily();
    }, 5000);

    // 2. Run whenever the app comes back from the background
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        runPruneOnceDaily();
      }
    });

    return () => {
      clearTimeout(initialTimer);
      subscription.remove();
    };
  }, []);
}