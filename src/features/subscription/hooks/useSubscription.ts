import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";

export const useSubscription = () => {
  const { user, setTier } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("premium");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      const result = await apiSubscribe({
        planId: selectedPlanId,
        method: "google_play_mock",
      });

      await user.getIdToken(true);

      setTier(result.newTier);

      Alert.alert("Success", "Subscription activated!");
    } catch (error) {
      console.error("Payment Flow Error:", error);
      Alert.alert("Error", "Could not process subscription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { selectedPlanId, setSelectedPlanId, handlePay, isProcessing };
};
