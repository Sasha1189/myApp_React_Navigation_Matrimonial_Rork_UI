import React from "react";
import { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationProp, EventListenerCallback } from "@react-navigation/native";

/**
 * Warn user before leaving screen if unsaved changes exist
 * @param navigation - your navigation object
 * @param isDirty - boolean if form has unsaved changes
 */
export function useUnsavedChangesPrompt(
  navigation: NavigationProp<any>,
  isDirty: boolean
) {
  useEffect(() => {
    const beforeRemoveListener: EventListenerCallback<"beforeRemove", any> = (e) => {
      if (!isDirty) return;

      e.preventDefault();

      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    };

    const unsubscribe = navigation.addListener("beforeRemove", beforeRemoveListener);

    return unsubscribe;
  }, [navigation, isDirty]);
}
