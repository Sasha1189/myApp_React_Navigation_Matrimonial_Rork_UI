import { auth } from "../../../config/firebase";
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
import { theme } from "../../../theme";
import { Profile } from "../../../types/profile";
import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

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

const GenderModal: React.FC<GenderModalProps> = ({ visible, onClose }) => {
  const { setUser } = useAuth();
  const [gender, setGender] = useState<Gender>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [retry, setRetry] = useState<boolean>(false);

  const scaleValue = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95, // Shrink to 95%
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Back to 100%
      useNativeDriver: true,
    }).start();
  };

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const createUser = async (
    firebaseUser: FirebaseUserLike | null,
  ): Promise<void> => {
    try {
      if (!firebaseUser) return;
      const newUser = {
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber,
        displayName: firebaseUser.displayName,
      };
      // create on backend
      await api.post(`/users/create-user`, newUser);
    } catch (error) {
      console.error("Error creating user in backend:", error);
      // swallow - optional retry handled elsewhere
    }
  };

  const updateFirebaseUser = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!gender) {
      Alert.alert("Select Gender", "Please select a gender before updating.");
      return;
    }
    setLoading(true);
    setRetry(false);

    try {
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: gender,
        });
        await currentUser.reload();

        const updatedUser = auth.currentUser;

        setUser(updatedUser);
        await createUser(updatedUser);

        Alert.alert(
          "Done!",
          "Gender updated successfully. Next Add your profile.",
        );
        onClose();
      }
    } catch (error) {
      console.error("Update failed:", error);
      setRetry(true);
      Alert.alert("Error", "Could not update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Please select your gender</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[
                styles.modalButtonMale,
                gender === "Male" && styles.maleSelected,
              ]}
              onPress={() => setGender("Male")}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>Male</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalButtonFemale,
                gender === "Female" && styles.femaleSelected,
              ]}
              onPress={() => setGender("Female")}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>Female</Text>
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
                {retry ? "Try Again" : "Update"}
              </Text>
            )}
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
};

export default GenderModal;

const styles = StyleSheet.create({
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
    // alignContent: "flex-end",
    // marginTop: 20,
    // backgroundColor: "gray",
    // paddingVertical: 10,
    // paddingHorizontal: 24,
    // borderRadius: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12, // More modern rounded look
    minHeight: 48, // Standard touch target size
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
