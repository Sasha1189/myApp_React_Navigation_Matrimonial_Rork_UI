import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface PasswordSetupStepProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
}

export const PasswordSetupStep: React.FC<PasswordSetupStepProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [securePass, setSecurePass] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const { t } = useTranslation();

  return (
    <View style={styles.inputFlexContainer}>
      <Text style={styles.fieldLabel}>
        {t("auth.setupPass", "Setup Password")}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { letterSpacing: securePass ? 4 : 0.5 }]}
          placeholder="Setup password (Min. 6 characters)"
          placeholderTextColor="#A8A8A8"
          secureTextEntry={securePass}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setSecurePass(!securePass)}
          activeOpacity={0.7}
          style={styles.eyeBtn}
        >
          {securePass ? (
            <EyeOff size={20} color="#8A8A8A" />
          ) : (
            <Eye size={20} color="#1c7ed6" />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
        {t("auth.confirmPass", "Confirm Password")}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { letterSpacing: secureConfirm ? 4 : 0.5 }]}
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
  textInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111" },
  eyeBtn: { paddingLeft: 10, justifyContent: "center", alignItems: "center" },
});
