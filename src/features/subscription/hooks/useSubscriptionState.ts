import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppNavigation } from "@/navigation/hooks";
import {
  SubscriptionStep,
  SubscriptionError,
  ErrorStage,
} from "../utils/subscription.utils";
import {
  showSubscriptionSuccess,
  handleWorkflowErrorAlert,
} from "../utils/subscription.alerts";

export const useSubscriptionState = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  const [processingStep, setProcessingStep] =
    useState<SubscriptionStep>("idle");
  const [errorInfo, setErrorInfo] = useState<SubscriptionError | null>(null);

  const triggerError = useCallback(
    (stage: ErrorStage, error: any) => {
      console.error(`[IAP ERROR - ${stage.toUpperCase()}]:`, error);
      setProcessingStep("idle");
      setErrorInfo({ stage, message: error?.message || "An error occurred." });
      handleWorkflowErrorAlert(stage, error, t, navigation);
    },
    [t, navigation],
  );

  const triggerSuccess = useCallback(() => {
    setProcessingStep("success");
    showSubscriptionSuccess(t, navigation);
    setProcessingStep("idle");
  }, [t, navigation]);

  return {
    processingStep,
    setProcessingStep,
    errorInfo,
    setErrorInfo,
    triggerError,
    triggerSuccess,
  };
};
