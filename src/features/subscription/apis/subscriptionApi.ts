// src/features/subscription/api/subscriptionApi.ts
import { api } from "../../../services/api"; // Adjust based on your actual path

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  newTier: "trial" | "basic" | "premium";
}

export async function apiSubscribe(payload: {
  planId: string;
  purchaseToken: string;
  packageName: string;
  method: string;
}): Promise<SubscriptionResponse> {
  console.log("[API] Verifying subscription with backend...", payload);

  const res = await api.post<SubscriptionResponse>(
    `/subscription/update-subscription`,
    payload,
  );

  if (!res?.success) {
    throw new Error(res?.message || "Subscription failed");
  }

  return res;
}
