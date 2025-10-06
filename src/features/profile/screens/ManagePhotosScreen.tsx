import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Edit3, Image as ImageIcon } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { theme } from "../../../theme";
import { AppStackParamList } from "../../../navigation/types";
import { useProfileContext } from "../../../context/ProfileContext";
import { usePhotoManager } from "../hooks/usePhotoManager";
import ManagePhotosGrid from "../components/photos/ManagePhotosGrid";
import UploadButton from "../components/photos/UploadButton";

type Nav = NativeStackNavigationProp<AppStackParamList, "ManagePhotos">;

export default function ManagePhotosScreen() {
  const navigation = useNavigation<Nav>();

  const { profile } = useProfileContext();

  const {
    photos,
    maxPhotos,
    isEditing,
    loading,
    addPhoto,
    deletePhoto,
    setPrimary,
    uploadPhotos,
  } = usePhotoManager(profile);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Manage Photos",
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: "white",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary + "20", "transparent"]}
        style={styles.headerGradient}
      />

      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <ImageIcon size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Photo Guidelines</Text>
            <Text style={styles.infoText}>
              • Upload up to {maxPhotos} photos{"\n"}• Avoid group photos or
              sunglasses
            </Text>
          </View>
        </View>

        {/* Photos Grid */}
        <ManagePhotosGrid
          photos={photos}
          maxPhotos={maxPhotos}
          onAdd={addPhoto}
          onDelete={deletePhoto}
          onSetPrimary={setPrimary}
        />

        {/* Save Button */}
        <UploadButton
          loading={loading}
          isEditing={isEditing}
          onPress={uploadPhotos}
        />

        {/* Tip */}
        <View style={styles.tipCard}>
          <Edit3 size={20} color={theme.colors.accent} />
          <Text style={styles.tipText}>
            Tap star to set primary. Tap X to delete.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl },
  infoCard: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: "row",
  },
  infoContent: { flex: 1, marginLeft: theme.spacing.md },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: { fontSize: theme.fontSize.sm, color: theme.colors.textLight },
  tipCard: {
    backgroundColor: theme.colors.accent + "20",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
});
