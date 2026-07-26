import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useIAP, ErrorCode, Purchase } from "react-native-iap";
import { getIdToken } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { apiSubscribe } from "../apis/subscriptionApi";
import { useTranslation } from "react-i18next";
import { storage } from "@/cache/cacheConfig";
import { apiUpdateProfile } from "@/features/profile/api/profileApi";
import { useAppNavigation } from "@/navigation/hooks";

const SKUS = ["basic_membership_1y", "premium_membership_1y"];
const PROFILE_CACHE_KEY = "self_profile_cache";

export const useSubscription = () => {
  const { user, tier, setTier, setMyProfile } = useAuth();
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    tier && tier !== "none" ? tier : "",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useAppNavigation();

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

        // isConsumable: true allows buying it again after a year if needed
        await finishTransaction({ purchase, isConsumable: true });

        if (user) await getIdToken(user, true);
        setTier(result.newTier);

        // STEP 4: ISOLATED POST-PAYMENT CLOUD SYNC
        if (user && result.newTier) {
          try {
            const cachedString = storage.getString(PROFILE_CACHE_KEY);
            if (cachedString) {
              const currentLocalProfile = JSON.parse(cachedString);

              delete currentLocalProfile.photos;
              delete currentLocalProfile.thumbnail;

              const completeCloudPayload = {
                ...currentLocalProfile,
                uid: user?.uid,
                gender: user?.displayName,
                tier: result.newTier,
                photos: [],
                thumbnail: "",
              };

              await apiUpdateProfile(completeCloudPayload);

              storage.set(
                PROFILE_CACHE_KEY,
                JSON.stringify(completeCloudPayload),
              );

              setMyProfile(completeCloudPayload);
            }
          } catch (syncErr) {
            // 🟢 SHIELD CATCH: If profile sync drops out, we catch it here so it NEVER hangs the UI!
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
        Alert.alert(
          t("common.error", "Error"),
          t(
            "subscription.verifyError",
            "Could not process subscription. Please try again.",
          ),
          [{ text: "OK", onPress: () => navigation.navigate("Tabs" as any) }],
        );
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

  // handle pay......
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

    // 🌟 TYPE SAFEGUARD: Confirms platform is Android to unlock properties
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

  return {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans: products,
  };
};
