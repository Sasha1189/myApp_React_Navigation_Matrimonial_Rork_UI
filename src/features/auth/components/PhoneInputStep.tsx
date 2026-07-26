import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
// Make sure to import Eye and EyeOff from your active icon package
import { Eye, EyeOff } from "lucide-react-native";

interface PhoneInputStepProps {
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const { t } = useTranslation();

  // Local states to toggle text visibility masks
  const [securePass, setSecurePass] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  return (
    <View style={styles.inputFlexContainer}>
      {/* 🎯 FIELD 1: MOBILE NUMBER INPUT */}
      <Text style={styles.fieldLabel}>{t("auth.fieldLabelPhone")}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Mobile Number"
          placeholderTextColor="#A8A8A8"
          keyboardType="number-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ""))}
        />
      </View>

      {/* 🎯 FIELD 2: PASSWORD SETUP INPUT */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
        {t("auth.setupPass")}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { letterSpacing: securePass ? 2 : 0.5 }]}
          placeholder="Setup password (Min. 6 Char)"
          placeholderTextColor="#A8A8A8"
          secureTextEntry={securePass}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setSecurePass(!securePass)}
          activeOpacity={0.7}
          style={styles.eyeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {securePass ? (
            <EyeOff size={20} color="#8A8A8A" />
          ) : (
            <Eye size={20} color="#1c7ed6" />
          )}
        </TouchableOpacity>
      </View>

      {/* 🎯 FIELD 3: CONFIRM PASSWORD INPUT */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
        {t("auth.confirmPass")}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { letterSpacing: secureConfirm ? 2 : 0.5 }]}
          placeholder="Re-enter password to confirm"
          placeholderTextColor="#A8A8A8"
          secureTextEntry={secureConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setSecureConfirm(!secureConfirm)}
          activeOpacity={0.7}
          style={styles.eyeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {secureConfirm ? (
            <EyeOff size={20} color="#8A8A8A" />
          ) : (
            <Eye size={20} color="#1c7ed6" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputFlexContainer: { width: "100%", marginTop: 4 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCDFE6",
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: "white",
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginRight: 12,
    letterSpacing: 0.5,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
    letterSpacing: 1,
  },
  eyeBtn: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
