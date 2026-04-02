import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";

export const useSubscription = () => {
  const { user, tier, setTier } = useAuth();
  const { t } = useTranslation();

  // Initialize with current tier if it exists, otherwise empty
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "",
  );

  const [isProcessing, setIsProcessing] = useState(false);

  // LOGIC: Disable button if:
  // 1. No plan is selected
  // 2. The selected plan is the one they ALREADY have
  // 3. We are currently processing a payment
  const isSubmitDisabled =
    !selectedPlanId || selectedPlanId === tier || isProcessing;

  const handlePay = async () => {
    if (isSubmitDisabled) return;

    if (!user) return;
    setIsProcessing(true);

    try {
      const result = await apiSubscribe({
        planId: selectedPlanId,
        method: "google_play_mock",
      });

      await user.getIdToken(true);
      setTier(result.newTier);
      Alert.alert(t("common.success"), t("subscription.activated"));
    } catch (error) {
      console.error("Payment Flow Error:", error);
      Alert.alert(t("common.error"), t("subscription.payError"));
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
  };
};
