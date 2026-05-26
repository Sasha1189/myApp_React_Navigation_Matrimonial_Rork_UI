import { auth, updateProfile, reload } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthContext";
import {
  View,
  Text,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useRef } from "react";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Profile } from "../../../types/profile";
import { createUserOnBackend } from "../apis/userApi";
import { useTranslation } from "react-i18next";
import { getUniqueId } from "react-native-device-info";
import { setDBDeviceIdCache } from "../../../cache/cacheConfig";

interface GenderModalProps {
  visible: boolean;
  onClose: () => void;
}
type Gender = Profile["gender"];
interface FirebaseUserLike {
  uid: string;
  phoneNumber?: string | null;
  displayName?: string | null;
}

export default function GenderModal({ visible, onClose }: GenderModalProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const { setUser } = useAuth();
  const [gender, setGender] = useState<Gender>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [retry, setRetry] = useState<boolean>(false);
  const { t } = useTranslation();

  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const createUser = async (
    firebaseUser: FirebaseUserLike | null,
  ): Promise<void> => {
    if (!firebaseUser) return;
    await createUserOnBackend({
      uid: firebaseUser.uid,
      phoneNumber: firebaseUser?.phoneNumber || "",
      displayName: firebaseUser?.displayName || "",
    });
  };

  const updateFirebaseUser = async (): Promise<void> => {
    const currentUser = auth.currentUser;

    if (!gender) {
      Alert.alert(
        t("genderModal.selectGender"),
        t("genderModal.selectGenderMsg"),
      );
      return;
    }

    setLoading(true);
    setRetry(false);

    try {
      if (currentUser) {
        // 1. Update gender locally in Firebase Authentication
        await updateProfile(currentUser, {
          displayName: gender,
        });

        // 2. Refresh the native user token session parameters
        await reload(currentUser);
        const updatedUser = auth.currentUser;

        if (updatedUser) {
          // 3. Await database registration backend response
          await createUser(updatedUser);

          // 4. Update the Auth Context to broadcast completion state to the app
          setUser(updatedUser);

          // 5. Safely close the modal now that everything is synchronized
          onClose();
          Alert.alert(t("genderModal.done"), t("genderModal.successMsg"));
        }
      }
    } catch (error) {
      console.error("Synchronized registration workflow broke:", error);
      setRetry(true);
      Alert.alert(t("common.error"), t("genderModal.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (!theme) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{t("genderModal.title")}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[
                styles.modalButtonMale,
                gender === "Male" && styles.maleSelected,
              ]}
              onPress={() => setGender("Male")}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>
                {t("genderModal.male")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalButtonFemale,
                gender === "Female" && styles.femaleSelected,
              ]}
              onPress={() => setGender("Female")}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>
                {t("genderModal.female")}
              </Text>
            </Pressable>
          </View>
          <AnimatedPressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={updateFirebaseUser}
            disabled={loading || !gender}
            style={[
              styles.modalButtonUpdate,
              { transform: [{ scale: scaleValue }] },
              { backgroundColor: gender ? theme.colors.primary : "#A0AEC0" },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.modalButtonText}>
                {retry ? t("genderModal.retry") : t("genderModal.update")}
              </Text>
            )}
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: "#fff",
      padding: 24,
      borderRadius: 10,
      width: "80%",
      alignItems: "center",
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: "center",
    },
    modalButtonMale: {
      backgroundColor: "lightgray",
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    modalButtonFemale: {
      backgroundColor: "lightgray",
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    modalButtonUpdate: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      // Soft shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    modalButtonText: {
      color: "#fff",
      fontSize: 16,
    },
    femaleSelected: {
      backgroundColor: "#FF1493", // Pink for Female
    },
    maleSelected: {
      backgroundColor: "#007AFF", // Blue for Male
    },
  });
