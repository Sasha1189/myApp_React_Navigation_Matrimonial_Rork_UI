import React from "react";
import { View, StyleSheet } from "react-native";

interface StepIndicatorBarProps {
  // 👑 UPDATE 1: Cleaned type limits to strictly match your active 2-step setup criteria
  step: "PHONE_INPUT" | "OTP_VERIFY";
}

export const StepIndicatorBar: React.FC<StepIndicatorBarProps> = ({ step }) => {
  return (
    <View style={styles.indicatorBarContainer}>
      {/* Segment 1: Mobile Entry & Password State tracking */}
      <View
        style={[
          styles.indicatorSegment,
          step === "PHONE_INPUT"
            ? styles.segmentActive
            : styles.segmentInactive,
        ]}
      />

      {/* Segment 2: SMS OTP Verification checkpoint tracker */}
      <View
        style={[
          styles.indicatorSegment,
          step === "OTP_VERIFY" ? styles.segmentActive : styles.segmentInactive,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorBarContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    marginBottom: 20,
  },
  // 👑 UPDATE 2: Both segments will now divide the horizontal space 50/50 automatically
  indicatorSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentActive: {
    backgroundColor: "#1A1A4B",
  },
  segmentInactive: {
    backgroundColor: "#E4E7ED",
  },
});
