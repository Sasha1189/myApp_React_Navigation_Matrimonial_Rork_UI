export const SUBSCRIPTION_SKUS = [
  "basic_membership_1y",
  "premium_membership_1y",
];

export const PLAN_TO_SKU_MAP: Record<string, string> = {
  basic: "basic_membership_1y",
  premium: "premium_membership_1y",
};

export const getAndroidOfferToken = (product: any): string | undefined => {
  if (product?.platform !== "android" || !product?.discountOffers)
    return undefined;
  const promoOffer = product.discountOffers.find((offer: any) => offer.id);
  return promoOffer?.offerTokenAndroid;
};

// --- Types ---
export type SubscriptionStep =
  | "idle"
  | "initiating"
  | "verifying"
  | "syncing_profile"
  | "success";
export type ErrorStage =
  | "store_payment"
  | "backend_verification"
  | "profile_sync";
export interface SubscriptionError {
  stage: ErrorStage;
  message: string;
}

export const PACKAGE_NAME = "com.sasha.lonariyouvaconnect";
