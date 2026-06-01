import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface AuthFooterActionsProps {
  // 👑 UPDATE 1: Narrowed typing constraint parameter entries down to 2 states
  step: "PHONE_INPUT" | "OTP_VERIFY";
  isLoading: boolean;
  finalButtonDisabled: boolean;
  handleAuthSubmit: () => void;
  openLink: (url: string, title: string) => void;
  insets: { bottom: number; top: number; left: number; right: number };
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
}

export const AuthFooterActions: React.FC<AuthFooterActionsProps> = ({
  step,
  isLoading,
  finalButtonDisabled,
  handleAuthSubmit,
  openLink,
  insets,
  agreeTerms,
  setAgreeTerms,
}) => {
  const { t } = useTranslation();

  // 👑 UPDATE 2: Simplified copy handler rules since password setup is unified
  const getButtonText = () => {
    if (step === "OTP_VERIFY") {
      return t("auth.submitVerifyOtp", "Verify & Proceed");
    }
    return t("auth.submitRegister", "Sign Up");
  };

  return (
    <View
      style={[
        styles.footerSection,
        {
          paddingBottom:
            Platform.OS === "android" ? Math.max(insets.bottom, 16) : 16,
        },
      ]}
    >
      {step === "PHONE_INPUT" && (
        <>
          {/* 👑 UPDATE 3: Restored your active domain webview asset URLs */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
              style={[styles.checkboxBox, agreeTerms && styles.checkboxActive]}
            >
              {agreeTerms && <Check size={12} color="white" strokeWidth={3} />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              {t("auth.agreePrefix")}
              <Text
                style={{ color: "#1c7ed6", fontWeight: "500" }}
                onPress={() =>
                  openLink(
                    "https://sasha1189.github.io/youva-Lonari/terms.html",
                    "Terms",
                  )
                }
              >
                {t("auth.termsLinkText")}
              </Text>
              {t("auth.agreeConjunction")}
              <Text
                style={{ color: "#1c7ed6", fontWeight: "500" }}
                onPress={() =>
                  openLink(
                    "https://sasha1189.github.io/youva-Lonari/privacy.html",
                    "Privacy",
                  )
                }
              >
                {t("auth.privacyLinkText")}
              </Text>
              {t("auth.agreeSuffix", ".")}
            </Text>
          </View>
        </>
      )}

      {/* Main Form Process Button */}
      <TouchableOpacity
        style={[
          styles.actionSubmitBtn,
          finalButtonDisabled && styles.actionDisabledBtn,
        ]}
        disabled={finalButtonDisabled}
        onPress={handleAuthSubmit}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            style={[
              styles.actionSubmitText,
              finalButtonDisabled && styles.actionDisabledText,
            ]}
          >
            {getButtonText()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerSection: {
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "white",
    marginTop: 24,
  },
  clickableTextContainer: {
    paddingVertical: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  agreeText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  linkText: { color: "#1c7ed6", fontWeight: "600" },
  actionSubmitBtn: {
    backgroundColor: "#1A1A4B",
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
    width: "100%",
  },
  actionSubmitText: { color: "white", fontSize: 15, fontWeight: "700" },
  actionDisabledBtn: { backgroundColor: "#E4E7ED" },
  actionDisabledText: { color: "#A8ABB2" },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingRight: 16,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#A3A3A3",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#1A1A4B", borderColor: "#1A1A4B" },
  checkboxLabel: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
    letterSpacing: 1.2,
  },
});
