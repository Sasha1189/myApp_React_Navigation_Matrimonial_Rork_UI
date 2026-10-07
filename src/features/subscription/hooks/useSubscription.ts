// import { useState, useEffect, useCallback } from "react";
// import { Alert, Platform } from "react-native";
// import { useIAP, ErrorCode, Purchase } from "react-native-iap";
// import { useAuth, UserTier } from "@/context";
// import { apiVerifySubscriptionReceipt } from "../apis/subscriptionApi";
// import { useCreateProfile } from "@/features/profile/hooks/useCreateProfile";
// import { useTranslation } from "react-i18next";
// import { useSubscriptionState } from "./useSubscriptionState";

// import {
//   SUBSCRIPTION_SKUS,
//   PLAN_TO_SKU_MAP,
//   getAndroidOfferToken,
//   PACKAGE_NAME,
// } from "../utils/subscription.utils";

// export const useSubscription = () => {
//   const { user, tier, refreshToken } = useAuth();
//   const { createProfileOnServer } = useCreateProfile();
//   const { t } = useTranslation();
//   const {
//     processingStep,
//     setProcessingStep,
//     errorInfo,
//     setErrorInfo,
//     triggerError,
//     triggerSuccess,
//   } = useSubscriptionState();

//   // --- State ---
//   const [selectedPlanId, setSelectedPlanId] = useState<string>(
//     tier && tier !== "none" ? tier : "none",
//   );
//   const isProcessing =
//     processingStep !== "idle" && processingStep !== "success";

//   // --- Main Purchase Workflow ---
//   const handlePurchaseSuccess = async (purchase: Purchase) => {
//     setErrorInfo(null);
//     // Extract token based on platform (Android vs iOS)
//     const token = purchase.purchaseToken || purchase.transactionId;

//     if (!token) {
//       return triggerError(
//         "backend_verification",
//         new Error("Purchase token or transaction receipt is missing."),
//       );
//     }

//     let verifiedTier = "none" as UserTier;

//     // Step 1: Verify Payment
//     setProcessingStep("verifying");

//     try {
//       const result = await apiVerifySubscriptionReceipt({
//         planId: purchase.productId,
//         purchaseToken: purchase.purchaseToken || "",
//         packageName: PACKAGE_NAME,
//         method:
//           Platform.OS === "android" ? "google_play_real" : "apple_app_store",
//       });

//       await finishTransaction({ purchase, isConsumable: true });
//       await refreshToken(true);

//       verifiedTier = result?.newTier as UserTier;
//     } catch (err) {
//       return triggerError("backend_verification", err);
//     }

//     // Step 2: Sync Profile
//     setProcessingStep("syncing_profile");

//     try {
//       await createProfileOnServer(verifiedTier);
//     } catch (err) {
//       return triggerError("profile_sync", err);
//     }

//     // Step 3: Success
//     triggerSuccess();
//   };

//   // --- IAP Initialization ---

//   const {
//     connected,
//     products,
//     fetchProducts,
//     requestPurchase,
//     finishTransaction,
//   } = useIAP({
//     onPurchaseSuccess: handlePurchaseSuccess,
//     onPurchaseError: (error) => {
//       if (error.code !== ErrorCode.UserCancelled)
//         triggerError("store_payment", error);
//       else setProcessingStep("idle");
//     },
//   });

//   useEffect(() => {
//     if (connected) fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "in-app" });
//   }, [connected]);

//   const isSubmitDisabled =
//     !selectedPlanId || selectedPlanId === tier || isProcessing;

//   const handlePay = async () => {
//     if (isSubmitDisabled || !user) return;
//     setErrorInfo(null);
//     setProcessingStep("initiating");

//     const targetSku = PLAN_TO_SKU_MAP[selectedPlanId.toLowerCase()];
//     const product = products.find((p) => p.id === targetSku);

//     if (!product) {
//       Alert.alert(t("common.error"), "Product not currently available.");
//       setProcessingStep("idle");
//       return;
//     }

//     try {
//       await requestPurchase({
//         type: "in-app",
//         request: {
//           google: {
//             skus: [targetSku],
//             ...(getAndroidOfferToken(product) && {
//               offerToken: getAndroidOfferToken(product),
//             }),
//           },
//           apple: { sku: targetSku },
//         },
//       });
//     } catch (error) {
//       triggerError("store_payment", error);
//     }
//   };

//   const isLoadingPlans = connected && (!products || products.length === 0);

//   return {
//     selectedPlanId,
//     setSelectedPlanId,
//     handlePay,
//     isProcessing,
//     processingStep,
//     errorInfo,
//     isSubmitDisabled,
//     availablePlans: products,
//     isLoadingPlans,
//     hasError: connected && !isLoadingPlans && products.length === 0,
//     refetchPlans: useCallback(
//       () => fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "in-app" }),
//       [fetchProducts],
//     ),
//   };
// };

import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import { useIAP, ErrorCode, Purchase } from "react-native-iap";
import { useAuth, UserTier } from "@/context";
import { apiVerifySubscriptionReceipt } from "../apis/subscriptionApi";
import { useCreateProfile } from "@/features/profile/hooks/useCreateProfile";
import { useTranslation } from "react-i18next";
import { useSubscriptionState } from "./useSubscriptionState";
import {
  SUBSCRIPTION_SKUS,
  PLAN_TO_SKU_MAP,
  getAndroidOfferToken,
  PACKAGE_NAME,
} from "../utils/subscription.utils";

export const useSubscription = () => {
  // 1. Hooks & External State
  const { user, tier, refreshToken } = useAuth();
  const { createProfileOnServer } = useCreateProfile();
  const { t } = useTranslation();

  const {
    processingStep,
    setProcessingStep,
    errorInfo,
    setErrorInfo,
    triggerError,
    triggerSuccess,
  } = useSubscriptionState();

  // 2. Local State
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "none",
  );

  // 3. Derived State
  const isProcessing =
    processingStep !== "idle" && processingStep !== "success";
  const isSubmitDisabled =
    !selectedPlanId || selectedPlanId === tier || isProcessing;

  // 4. Ref to hold finishTransaction safely without sequence issues
  const finishTransactionRef = useRef<
    | ((args: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>)
    | null
  >(null);

  // 5. Workflow Handlers
  const handlePurchaseSuccess = async (purchase: Purchase) => {
    setErrorInfo(null);

    const token = purchase.purchaseToken || "";
    if (!token) {
      return triggerError(
        "backend_verification",
        new Error("Purchase token missing"),
      );
    }

    let verifiedTier = "none" as UserTier;
    setProcessingStep("verifying");

    try {
      const result = await apiVerifySubscriptionReceipt({
        planId: purchase.productId,
        purchaseToken: token,
        packageName: PACKAGE_NAME,
        method:
          Platform.OS === "android" ? "google_play_real" : "apple_app_store",
      });

      // Call finishTransaction safely from Ref
      if (finishTransactionRef.current) {
        await finishTransactionRef.current({ purchase, isConsumable: true });
      }

      const activeTier = await refreshToken(true); //refresh token also returns the active tier
      console.log("[tier from refreshToken]", activeTier);

      verifiedTier = result?.newTier as UserTier;
    } catch (err) {
      return triggerError("backend_verification", err);
    }

    setProcessingStep("syncing_profile");

    try {
      await createProfileOnServer(verifiedTier);
    } catch (err) {
      return triggerError("profile_sync", err);
    }

    triggerSuccess();
  };

  // 6. IAP Hook (Passed handlePurchaseSuccess)
  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: (error) => {
      if (error.code !== ErrorCode.UserCancelled) {
        triggerError("store_payment", error);
      } else {
        setProcessingStep("idle");
      }
    },
  });

  // Keep ref updated with latest finishTransaction function
  finishTransactionRef.current = finishTransaction;

  // 7. Side Effects
  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "in-app" });
    }
  }, [connected, fetchProducts]);

  // 8. User Actions
  const handlePay = async () => {
    if (isSubmitDisabled || !user) return;
    setErrorInfo(null);
    setProcessingStep("initiating");

    const targetSku = PLAN_TO_SKU_MAP[selectedPlanId.toLowerCase()];
    const product = products.find((p) => p.id === targetSku);

    if (!product) {
      Alert.alert(t("common.error"), "Product not currently available.");
      setProcessingStep("idle");
      return;
    }

    try {
      await requestPurchase({
        type: "in-app",
        request: {
          google: {
            skus: [targetSku],
            ...(getAndroidOfferToken(product) && {
              offerToken: getAndroidOfferToken(product),
            }),
          },
          apple: { sku: targetSku },
        },
      });
    } catch (error) {
      triggerError("store_payment", error);
    }
  };

  const isLoadingPlans = connected && (!products || products.length === 0);

  // 9. Return Value
  return {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    processingStep,
    errorInfo,
    isSubmitDisabled,
    availablePlans: products,
    isLoadingPlans,
    hasError: connected && !isLoadingPlans && products.length === 0,
    refetchPlans: useCallback(
      () => fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "in-app" }),
      [fetchProducts],
    ),
  };
};
