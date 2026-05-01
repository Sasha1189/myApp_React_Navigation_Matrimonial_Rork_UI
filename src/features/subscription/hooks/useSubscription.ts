import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useIAP, ErrorCode, Purchase } from "react-native-iap";
import { getIdToken } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";

const SKUS = ["basic_membership_1y", "premium_membership_1y"];

export const useSubscription = () => {
  const { user, tier, setTier } = useAuth();
  const { t } = useTranslation();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      try {
        const receipt = purchase.purchaseToken;
        const result = await apiSubscribe({
          planId: purchase.productId,
          purchaseToken: receipt || "",
          packageName: "com.sasha.lonariyouvaconnect",
          method:
            Platform.OS === "android" ? "google_play_real" : "apple_app_store",
        });

        // isConsumable: true allows buying it again after a year if needed
        await finishTransaction({ purchase, isConsumable: true });

        if (user) await getIdToken(user, true);
        setTier(result.newTier);
        Alert.alert(t("common.success"), t("subscription.activated"));
      } catch (error) {
        console.error("[IAP] Verification Error:", error);
        Alert.alert(t("common.error"), t("subscription.verifyError"));
      } finally {
        setIsProcessing(false);
      }
    },
    onPurchaseError: (error) => {
      setIsProcessing(false);
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert(t("common.error"), error.message);
      }
    },
  });

  useEffect(() => {
    if (connected) {
      // Corrected to 'in-app' per official v14.7 docs
      fetchProducts({ skus: SKUS, type: "in-app" });
    }
  }, [connected]);

  const isSubmitDisabled =
    !selectedPlanId || selectedPlanId === tier || isProcessing;

  // handle pay......
  const handlePay = async () => {
    if (isSubmitDisabled || !user) return;
    setIsProcessing(true);

    const PLAN_TO_SKU: Record<string, string> = {
      basic: "basic_membership_1y",
      premium: "premium_membership_1y",
    };

    const planKey = selectedPlanId.toLowerCase();

    // --- CASE 1: FREE TRIAL (Internal Logic) ---
    if (planKey === "trial") {
      try {
        // No Google Play involvement. Just tell the backend to grant the trial.
        const result = await apiSubscribe({
          planId: "trial",
          purchaseToken: "",
          packageName: "com.sasha.lonariyouvaconnect",
          method: "internal_free",
        });

        await getIdToken(user, true);
        setTier(result.newTier);
        Alert.alert(t("common.success"), t("subscription.activated"));
      } catch (error) {
        Alert.alert(t("common.error"), "Could not activate trial.");
      } finally {
        setIsProcessing(false);
      }
      return; // Exit here
    }

    // --- CASE 2: PAID PLANS (Google Play Logic) ---
    const targetSku = PLAN_TO_SKU[planKey];
    const product = products.find((p) => p.id === targetSku);

    if (!product) {
      Alert.alert(t("common.error"), "Product not currently available.");
      setIsProcessing(false);
      return;
    }

    try {
      await requestPurchase({
        type: "in-app",
        request: {
          google: { skus: [targetSku] },
          apple: { sku: targetSku },
        },
      });
      // Logic continues in onPurchaseSuccess listener
    } catch (error) {
      setIsProcessing(false);
      console.error("[IAP] Request Error:", error);
    }
  };

  return {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans: products,
  };
};
