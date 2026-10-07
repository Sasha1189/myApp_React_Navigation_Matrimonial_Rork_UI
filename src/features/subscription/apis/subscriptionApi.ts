import { api } from "@/services/api";

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  newTier: "basic" | "premium";
}

export async function apiVerifySubscriptionReceipt(payload: {
  planId: string;
  purchaseToken: string;
  packageName: string;
  method: string;
}): Promise<SubscriptionResponse> {
  const res = await api.post<SubscriptionResponse>(
    `/subscription/update-subscription`,
    payload,
  );

  if (!res?.success) {
    throw new Error(res?.message || "Subscription failed");
  }

  return res;
}
