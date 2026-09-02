import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useIAP, ErrorCode, Purchase } from "react-native-iap";
import { getIdToken } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";
import { appStorage, PROFILE_CACHE_KEY } from "@/cacheMMKV/cacheConfig";
import { apiUpdateProfile } from "@/features/profile/api/profileApi";
import { useAppNavigation } from "@/navigation/hooks";
import { sanitizePayload } from "@/utils/sanitizePayload";
import { generateTimeBasedSuffix } from "@/utils/IDGenerater";
import { Profile } from "@/features/profile/types/profile";
import { useMyProfile } from "@/features/profile/context/ProfileContext";

const SKUS = ["basic_membership_1y", "premium_membership_1y"];

export const useSubscription = () => {
  const { user, tier } = useAuth();
  const { myProfile, setMyProfile } = useMyProfile();
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

        if (user) await getIdToken(user, true);

        if (user && result.newTier) {
          try {
            if (myProfile) {
              let finalPid = myProfile?.pid || "";
              if (!finalPid || finalPid.trim() === "") {
                finalPid = generateTimeBasedSuffix(); // Generates "LYC-XXXX" once
              }

              const hasActiveTier =
                myProfile.tier === "basic" || myProfile.tier === "premium";

              let profileForSync: Profile = myProfile;

              if (!myProfile.tier || !hasActiveTier) {
                profileForSync = {
                  ...myProfile,
                  photos: [],
                  tn: "",
                };
              }

              const rawCloudPayload = {
                ...profileForSync,
                uid: user?.uid,
                gender: user?.displayName,
                tier: result.newTier,
                pid: finalPid,
              };

              const optimizedPayload = sanitizePayload(rawCloudPayload);

              optimizedPayload.uid = user?.uid;
              optimizedPayload.gender = user?.displayName;
              optimizedPayload.tier = result.newTier;
              optimizedPayload.pid = finalPid;
              optimizedPayload.ia = true;

              await apiUpdateProfile(optimizedPayload);

              setMyProfile(optimizedPayload as Profile);

              appStorage.set(
                PROFILE_CACHE_KEY,
                JSON.stringify(optimizedPayload),
              );
            }
          } catch (syncErr) {
            console.error(
              "❌ [POST-PAYMENT SYNC ERROR]: Non-fatal profile upload error caught safely:",
              syncErr,
            );
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
