import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthNavigation } from "../../../navigation/hooks";
import { Phone, ArrowRight, Heart } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

export default function PhoneSignInScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useAuthNavigation();

  const handleContinue = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    const fullPhone = `+91${phoneNumber}`;

    try {
      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(auth, fullPhone);

      navigation.navigate("OTPVerify", {
        phone: fullPhone,
        confirmation: confirmation,
      });
    } catch (error: any) {
      // Helpful hint for APKs
      const msg =
        error.code === "auth/app-not-authorized"
          ? "SHA-1 Fingerprint missing in Firebase Console!"
          : error.message;
      Alert.alert("Failed to send OTP", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };
  if (!theme) return null;
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoWrapper}>
                <Heart
                  size={32}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                />
              </View>
              <Text style={styles.title}>{t("auth.enterPhone")}</Text>
              <Text style={styles.subtitle}>{t("auth.phoneSubtitle")}</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <Phone size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.prefix}>+91</Text>
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="999 888 7777"
                  placeholderTextColor={theme.colors.textLight}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !phoneNumber.trim() && styles.disabledButton,
                ]}
                onPress={handleContinue}
                disabled={!phoneNumber.trim() || isLoading}
              >
                {isLoading ? (
                  <Text style={styles.continueText}>{t("auth.sending")}</Text>
                ) : (
                  <>
                    <Text style={styles.continueText}>
                      {t("auth.continue")}
                    </Text>
                    <ArrowRight size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.termsText}>{t("auth.terms")}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: "space-between",
    },
    header: {
      alignItems: "center",
      marginTop: height * 0.08,
    },
    logoWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textLight,
      textAlign: "center",
      fontWeight: "500",
      lineHeight: 22,
      letterSpacing: 0.3,
      paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
      alignItems: "center",
      width: "100%",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: "100%",
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      marginBottom: theme.spacing.xl,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    prefix: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.border,
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 2,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      width: "100%",
      paddingVertical: 18,
      borderRadius: theme.borderRadius.round,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    disabledButton: {
      backgroundColor: theme.colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
      width: "100%",
    },
    termsText: {
      fontSize: 12,
      color: theme.colors.textLight,
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: theme.spacing.md,
    },
  });
