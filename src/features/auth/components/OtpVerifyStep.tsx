import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { useTranslation } from "react-i18next";

interface OtpVerifyStepProps {
  phoneNumber: string;
  otpArray: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (text: string, index: number) => void;
  handleOtpKeyPress: (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => void;
  handleSendOtp: () => void;
  timer: number;
  isLoading: boolean;
}

export const OtpVerifyStep: React.FC<OtpVerifyStepProps> = ({
  phoneNumber,
  otpArray,
  inputRefs,
  handleOtpChange,
  handleOtpKeyPress,
  handleSendOtp,
  timer,
  isLoading,
}) => {
  const { t } = useTranslation();

  const formattedSeconds = timer < 10 ? `0${timer}` : timer;

  return (
    <View style={styles.inputFlexContainer}>
      {/* Label Row Group displaying active verification scope inline */}
      <View style={styles.labelRowGroup}>
        <Text style={styles.fieldLabel}>{t("auth.fieldLabelOtp")}</Text>

        {/* Container for static info and trigger button actions */}
        <View style={styles.phoneMetaContainer}>
          <Text style={styles.staticPhoneNumberText}>
            {`+91 ${phoneNumber}`}
          </Text>

          {/* 👑 FIX 1: Explicitly block clicks when isLoading is true to stop double-submissions */}
          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={timer > 0 || isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.getOtpInlineButton,
                (timer > 0 || isLoading) && styles.disabledGetOtpButton,
              ]}
            >
              {t("auth.btnGetOtpInline", "Get OTP")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.otpBoxesRow}>
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            // 👑 FIX 2: Added structural null guard safety check.
            // When leaving this screen, React Native clears layout trees, making 'ref' null.
            // Without this guard, setting inputRefs.current[index] = null throws unhandled reference exceptions!
            ref={(ref) => {
              if (inputRefs.current) {
                inputRefs.current[index] = ref;
              }
            }}
            style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <View style={styles.resendActionRow}>
        <TouchableOpacity
          onPress={handleSendOtp}
          disabled={timer > 0 || isLoading}
        >
          <Text
            style={[
              styles.subActionText,
              timer > 0 && styles.disabledSubAction,
            ]}
          >
            {t("auth.didNotReceive")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.timerText}>
          {timer > 0
            ? t("auth.resendIn", { seconds: formattedSeconds })
            : t("auth.resendAvailable")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputFlexContainer: { width: "100%", marginTop: 4 },
  labelRowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  phoneMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  staticPhoneNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    letterSpacing: 0.5,
  },
  getOtpInlineButton: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1c7ed6",
    textDecorationLine: "underline",
  },
  disabledGetOtpButton: {
    color: "#A8ABB2",
    textDecorationLine: "none",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  otpBox: {
    width: 48,
    height: 52,
    borderWidth: 1,
    borderColor: "#DCDFE6",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    backgroundColor: "white",
  },
  otpBoxFilled: { borderColor: "#1A1A4B", borderWidth: 1.5 },
  resendActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    alignItems: "center",
  },
  subActionText: { fontSize: 13, color: "#1c7ed6", fontWeight: "600" },
  disabledSubAction: { color: "#A8ABB2" },
  timerText: { fontSize: 12, color: "#666", fontWeight: "500" },
});
