import { Alert } from "react-native";
import { ErrorStage } from "../hooks/useSubscription";

export const showSubscriptionSuccess = (t: any, navigation: any) => {
  Alert.alert(t("common.success"), t("subscription.activated"), [
    { text: "OK", onPress: () => navigation.navigate("ManagePhotos") },
  ]);
};

export const handleWorkflowErrorAlert = (
  stage: ErrorStage,
  error: any,
  t: any,
  navigation: any,
) => {
  switch (stage) {
    case "store_payment":
      Alert.alert(
        t("subscription.paymentFailedTitle", "Payment Unsuccessful"),
        error?.message ||
          t(
            "subscription.paymentFailedMsg",
            "Your payment could not be processed.",
          ),
      );
      break;
    case "backend_verification":
      Alert.alert(
        t("common.error"),
        t(
          "subscription.verifyError",
          "Payment completed, but verification failed. Please contact support.",
        ),
        [{ text: "OK", onPress: () => navigation.navigate("Tabs") }],
      );
      break;
    case "profile_sync":
      Alert.alert(
        t("subscription.syncErrorTitle", "Profile Sync Warning"),
        t(
          "subscription.syncErrorMsg",
          "Subscription active, but profile update failed. Retry?",
        ),
        [{ text: t("common.cancel"), style: "cancel" }],
      );
      break;
  }
};
