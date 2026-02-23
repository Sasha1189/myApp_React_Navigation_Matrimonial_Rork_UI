import { useEffect } from "react";
import database from "@react-native-firebase/database";
import { AppState, AppStateStatus } from "react-native";
import { runPruneOnceDaily } from "./cachePrune";

export function useAppCacheManager() {
  useEffect(() => {
    // 2. Run whenever the app comes back from the background
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          database().goOnline();
          runPruneOnceDaily(); // Guard handles the "daily" logic
        } else if (nextAppState === "background") {
          database().goOffline();
        }
      },
    );

    return () => subscription.remove();
  }, []);
}
