import { getAuth, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Profile } from "../types/profile";
import { api } from "../src/services/api";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

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
  // Profile.gender is '' | 'Male' | 'Female' — use '' for not-selected
  const [gender, setGender] = useState<Gender>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [retry, setRetry] = useState<boolean>(false);

  const createUser = async (
    firebaseUser: FirebaseUserLike | null
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
      if (!currentUser?.displayName) {
        await updateProfile(currentUser as any, {
          displayName: gender,
        });
        // reload is not typed on currentUser here, call if available
        if ((currentUser as any)?.reload) {
          await (currentUser as any).reload();
        }
      }

      setUser(auth.currentUser as any);
      await createUser(auth.currentUser as any);

      Alert.alert(
        "Done!",
        "Gender updated successfully. Next Add your profile."
      );
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      setRetry(true);
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
          <TouchableOpacity
            style={styles.modalButtonUpdate}
            onPress={updateFirebaseUser}
            disabled={loading || !gender}
          >
            {loading ? (
              <LoadingScreen />
            ) : (
              <Text style={styles.modalButtonText}>
                {retry ? "Try Again" : "Update"}
              </Text>
            )}
          </TouchableOpacity>
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
    alignContent: "flex-end",
    marginTop: 20,
    backgroundColor: "gray",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
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
