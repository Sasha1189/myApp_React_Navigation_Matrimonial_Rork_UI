import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useIAP, ErrorCode, Purchase } from "react-native-iap";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";
import { useAppNavigation } from "@/navigation/hooks";
import { generateTimeBasedSuffix } from "@/features/profile/utils/IDGenerater";
import { useMyProfile } from "@/features/profile/context/ProfileContext";
import { sanitizePayload } from "@/features/profile/utils/sanitizePayload";

const SKUS = ["basic_membership_1y", "premium_membership_1y"];

export const useSubscription = () => {
  const { user, tier, refreshToken } = useAuth();
  const { myProfile, updateMyProfile } = useMyProfile();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useAppNavigation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "",
  );

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      setIsProcessing(true);
      try {
        const receipt = purchase.purchaseToken;

        const result = await apiSubscribe({
          planId: purchase.productId,
          purchaseToken: receipt || "",
          packageName: "com.sasha.lonariyouvaconnect",
          method:
            Platform.OS === "android" ? "google_play_real" : "apple_app_store",
        });

        await finishTransaction({ purchase, isConsumable: true });

        await refreshToken(true);

        if (user?.uid && result.newTier) {
          try {
            const pid = myProfile.pid?.trim() || generateTimeBasedSuffix();
            const validThumbnail = myProfile.tn ? myProfile.tn : "";
            const validRemotePhotos = (myProfile.photos || []).filter(
              (p) => !p.downloadURL,
            );
            console.log(
              "[useSubscription]Payload:",
              pid,
              result.newTier,
              validRemotePhotos,
              validThumbnail,
            );
            const rawPayload = sanitizePayload(myProfile);
            const cleanPayload = {
              ...rawPayload,
              pid,
              tier: result.newTier,
              photos: validRemotePhotos,
              tn: validThumbnail,
              ia: true,
            };
            await updateMyProfile(cleanPayload);
          } catch (syncErr) {
            console.error("[POST-PAYMENT SYNC ERROR]:", syncErr);
          }
        }

        Alert.alert(t("common.success"), t("subscription.activated"), [
          {
            text: "OK",
            onPress: () => navigation.navigate("ManagePhotos"),
          },
        ]);
      } catch (error) {
        Alert.alert(t("common.error"), t("subscription.verifyError"), [
          { text: "OK", onPress: () => navigation.navigate("Tabs" as any) },
        ]);
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
      fetchProducts({ skus: SKUS, type: "in-app" });
    }
  }, [connected]);

  const isSubmitDisabled =
    !selectedPlanId || selectedPlanId === tier || isProcessing;

  const handlePay = async () => {
    if (isSubmitDisabled || !user) return;
    setIsProcessing(true);

    const PLAN_TO_SKU: Record<string, string> = {
      basic: "basic_membership_1y",
      premium: "premium_membership_1y",
    };

    const planKey = selectedPlanId.toLowerCase();
    const targetSku = PLAN_TO_SKU[planKey];
    const product = products.find((p) => p.id === targetSku);

    if (!product) {
      Alert.alert(t("common.error"), "Product not currently available.");
      setIsProcessing(false);
      return;
    }

    let activeOfferToken = undefined;

    if (product.platform === "android" && product.discountOffers) {
      const promoOffer = product.discountOffers.find((offer: any) => offer.id);
      if (promoOffer) {
        activeOfferToken = promoOffer.offerTokenAndroid;
      }
    }

    try {
      await requestPurchase({
        type: "in-app",
        request: {
          google: {
            skus: [targetSku],
            ...(activeOfferToken && { offerToken: activeOfferToken }),
          },
          apple: { sku: targetSku },
        },
      });
    } catch (error) {
      setIsProcessing(false);
      console.error("[IAP] Request Error:", error);
    }
  };

  const isLoadingPlans = connected && (!products || products.length === 0);
  const hasError = connected && !isLoadingPlans && products.length === 0;

  return {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans: products,
    isLoadingPlans,
    hasError,
    refetchPlans: () => fetchProducts({ skus: SKUS, type: "in-app" }),
  };
};
