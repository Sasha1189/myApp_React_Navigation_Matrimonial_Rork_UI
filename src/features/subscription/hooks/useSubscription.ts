import { useState, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import {
  initConnection,
  endConnection,
  // @ts-ignore
  getSubscriptions,
  // @ts-ignore
  requestSubscription,
  finishTransaction,
  // @ts-ignore
  flushFailedPurchasesCachedAsPendingAndroid,
  purchaseUpdatedListener,
  purchaseErrorListener,
  Purchase,
  PurchaseError,
  Subscription,
} from "react-native-iap";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";

const PLAN_TO_SKU: Record<string, string> = {
  trial: "trial_plan", // Add your trial SKU mapping here
  basic: "basic_yearly",
  premium: "premium_yearly",
};

const SKUS =
  Platform.select({
    ios: ["basic_yearly", "premium_yearly", "trial_plan"],
    android: ["basic_yearly", "premium_yearly", "trial_plan"],
  }) || [];

export const useSubscription = () => {
  const { user, tier, setTier } = useAuth();
  const { t } = useTranslation();

  const [availablePlans, setAvailablePlans] = useState<Subscription[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep references to prevent recreating IAP listeners and connections on context updates
  const latestContext = useRef({ user, setTier, t });
  useEffect(() => {
    latestContext.current = { user, setTier, t };
  }, [user, setTier, t]);

  useEffect(() => {
    // 1. Setup Listeners synchronously to avoid memory leaks if component unmounts early
    // @ts-ignore
    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        // Explicit cast to 'any' since transactionReceipt might be omitted in current Purchase typings
        const receipt =
          (purchase as any).transactionReceipt || purchase.purchaseToken;

        if (receipt) {
          const {
            user: currentUser,
            setTier: currentSetTier,
            t: currentT,
          } = latestContext.current;
          try {
            // Verify with backend
            const result = await apiSubscribe({
              planId: purchase.productId,
              purchaseToken: receipt, // Fix: Use 'receipt' to support iOS transactionReceipt
              packageName: "com.yourapp.lonari",
              method:
                Platform.OS === "ios" ? "apple_app_store" : "google_play_real",
            });

            // Crucial: Finish transaction so Google/Apple doesn't refund
            await finishTransaction({ purchase, isConsumable: false });

            // Update state
            if (currentUser) await currentUser.getIdToken(true);
            currentSetTier(result.newTier);

            Alert.alert(
              currentT("common.success"),
              currentT("subscription.activated"),
            );
          } catch (error) {
            console.error("Backend Verification Error", error);
            Alert.alert(
              currentT("common.error"),
              currentT(
                "subscription.verifyError",
                "Subscription verification failed",
              ),
            );
          } finally {
            setIsProcessing(false);
          }
        }
      },
    );
    // 2. Setup Error Listener
    // @ts-ignore
    const purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        setIsProcessing(false);
        // Convert enum/code to string to fix "no overlap" TypeScript error
        if (String(error.code) !== "E_USER_CANCELLED") {
          Alert.alert(latestContext.current.t("common.error"), error.message);
        }
      },
    );

    const initIAP = async () => {
      try {
        await initConnection();
        if (Platform.OS === "android") {
          await flushFailedPurchasesCachedAsPendingAndroid();
        }

        // Fetch Products
        if (SKUS.length > 0) {
          const products = await getSubscriptions({ skus: SKUS });
          setAvailablePlans(products);
        }
      } catch (err) {
        console.error("IAP Init Error:", err);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
      endConnection();
    };
  }, []); // Run only once on mount to prevent constant disconnect/reconnects

  const isSubmitDisabled =
    !selectedPlanId || selectedPlanId === tier || isProcessing;

  const handlePay = async (): Promise<void> => {
    if (isSubmitDisabled || !user) return;
    setIsProcessing(true);

    try {
      // Map internal UI plan ID ('basic') to Google Play/App Store SKU ('basic_yearly')
      const targetSku = PLAN_TO_SKU[selectedPlanId] || selectedPlanId;

      const selectedPlan = availablePlans.find(
        // @ts-ignore
        (p) => p.productId === targetSku,
      );

      if (!selectedPlan) {
        throw new Error(
          `Plan not found for SKU: ${targetSku}. Please check your Google Play console and SKUS list.`,
        );
      }

      // Requirement for Android Billing V5+ (Offers)
      const offerToken =
        Platform.OS === "android" &&
        (selectedPlan as any)?.subscriptionOfferDetails?.length
          ? (selectedPlan as any).subscriptionOfferDetails[0].offerToken
          : undefined;

      // This call triggers the native sheet; the listener above handles the result
      await requestSubscription({
        sku: targetSku,
        ...(offerToken && {
          // @ts-ignore
          subscriptionOffers: [{ sku: targetSku, offerToken }],
          // @ts-ignore
        }),
      });
    } catch (error) {
      setIsProcessing(false);
      const iapError = error as PurchaseError;
      console.error("Request Subscription Error:", iapError.message);
      if (String(iapError.code) !== "E_USER_CANCELLED") {
        Alert.alert(
          t("common.error"),
          iapError.message || "Failed to initiate purchase",
        );
      }
    }
  };

  return {
    // @ts-ignore
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans,
  };
};
