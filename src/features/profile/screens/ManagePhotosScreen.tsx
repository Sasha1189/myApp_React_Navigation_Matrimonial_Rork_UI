import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { theme } from "../../../theme/index";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Edit3,
  Image as ImageIcon,
  Plus,
  Star,
  X,
} from "lucide-react-native";

import { AppStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../context/AuthContext";
import { useProfileContext } from "../../../context/ProfileContext";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Profile, Photo } from "src/types/profile";
import { useUpdateProfileData } from "../hooks/useProfile";

const { width } = Dimensions.get("window");
const photoSize = (width - theme.spacing.lg * 3) / 2;

type ManagePhotosScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "ManagePhotos"
>;

export default function ManagePhotosScreen() {
  const navigation = useNavigation<ManagePhotosScreenNavigationProp>();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { mutateAsync: updateProfile } = useUpdateProfileData(
    profile?.uid ?? "",
    profile?.gender
  );
  const [photos, setPhotos] = useState<Profile["photos"]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));

  // Initialize from profile context
  useEffect(() => {
    if (!profile) return;
    setPhotos(profile.photos || []);
  }, [profile]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Manage Photos",
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: "white",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddPhoto = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Permission to access photos is required."
      );
      return;
    }
    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled) return;
    try {
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;
      const processed = await processImage(uri);
      const newItem: Photo = {
        id: `local-${Date.now()}`,
        localUrl: processed,
        downloadURL: "",
        isPrimary: photos.length === 0, // first becomes primary
      };
      setPhotos((prev) => [...prev, newItem].slice(0, maxPhotos));
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to add photo", err);
      Alert.alert("Error", "Failed to process image");
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // If uploaded, delete from storage
          const toDelete = photos.find((p) => p.id === photoId);
          if (toDelete?.downloadURL) {
            deleteUnsavedDownloadUrlsFromStorage(toDelete.downloadURL).catch(
              (e) => console.error(e)
            );
          }
          const updated = photos.filter((photo) => photo.id !== photoId);
          // Ensure primary remains set
          if (!updated.some((p) => p.isPrimary) && updated.length) {
            updated[0].isPrimary = true;
          }
          setPhotos(updated);
          setIsEditing(true);
        },
      },
    ]);
  };

  const handleSetPrimary = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => ({ ...photo, isPrimary: photo.id === photoId }))
    );
    setIsEditing(true);
  };

  const renderPhotoSlot = (photo?: Photo, index?: number) => {
    if (!photo) {
      return (
        <TouchableOpacity
          key={`empty-${index}`}
          style={styles.emptyPhotoSlot}
          onPress={handleAddPhoto}
        >
          <Plus size={32} color={theme.colors.textLight} />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View key={photo.id} style={styles.photoContainer}>
        <Image
          source={{ uri: photo.localUrl || photo.downloadURL }}
          style={styles.photo}
        />
        {photo.isPrimary && (
          <View style={styles.primaryBadge}>
            <Star size={16} color="white" fill="white" />
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetPrimary(photo.id)}
          >
            <Star
              size={20}
              color={photo.isPrimary ? theme.colors.warning : "white"}
              fill={photo.isPrimary ? theme.colors.warning : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePhoto(photo.id)}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const maxPhotos = 4;
  const emptySlots = Math.max(0, maxPhotos - photos.length);

  // Helpers from AddImages
  const processImage = async (uri: string) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error("File does not exist");
    if (
      fileInfo.size > 1024 * 1024 ||
      (!uri.toLowerCase().endsWith(".jpg") &&
        !uri.toLowerCase().endsWith(".jpeg"))
    ) {
      const processed = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.75,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return processed.uri;
    }
    return uri;
  };

  const uriToBlob = async (uri: string) => {
    const res = await fetch(uri);
    const blob = await res.blob();
    return blob;
  };

  const uploadImages = async () => {
    if (!isEditing) {
      Alert.alert("No Changes", "You haven't made any image changes.");
      return;
    }
    if (!photos.length) {
      Alert.alert("No Images", "Please select images before uploading.");
      return;
    }
    const pending = photos.filter((p) => !p.downloadURL);
    if (!pending.length) {
      Alert.alert("All Done", "All selected photos are already uploaded.");
      return;
    }

    setLoading(true);
    setProgress(new Animated.Value(0));

    // setProgress(new (require("react-native").Animated.Value)(0));
    const storage = getStorage();
    const uploadedUrls: string[] = [];
    try {
      const uploadPromises = photos.map((image) => {
        if (image.downloadURL) return null;
        const uniqueFilename = `IMG_${new Date()
          .toISOString()
          .replace(/[-:.TZ]/g, "")}_${Math.floor(Math.random() * 10000)}.jpg`;
        const storageRef = ref(
          storage,
          `users/${user?.uid}/profileImages/${uniqueFilename}`
        );
        return uriToBlob(image.localUrl as string).then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const uploadTask = uploadBytesResumable(storageRef, blob as any);
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const prog = snapshot.bytesTransferred / snapshot.totalBytes;
                  require("react-native")
                    .Animated.timing(progress, {
                      toValue: prog,
                      duration: 200,
                      useNativeDriver: false,
                    })
                    .start();
                },
                (err) => reject(err),
                async () => {
                  const downloadURL = await getDownloadURL(
                    uploadTask.snapshot.ref
                  );
                  uploadedUrls.push(downloadURL);
                  // update local image
                  image.downloadURL = downloadURL;
                  resolve(downloadURL);
                }
              );
            })
        );
      });

      await Promise.all(uploadPromises.filter(Boolean));
      // All uploads done, now save URLs to profile
      if (typeof updateProfile === "function") {
        try {
          await updateProfile({ photos });
          Alert.alert("Success", "Images uploaded successfully!");
          setIsEditing(false);
        } catch (error) {
          console.error("Failed to upload URLs to DB:", error);

          for (const url of uploadedUrls) {
            deleteUnsavedDownloadUrlsFromStorage(url);
          }
          Alert.alert(
            "Upload Failed",
            "Images were uploaded but failed to save. Please try again."
          );
        }
      }
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
      setTimeout(
        () => setProgress(new (require("react-native").Animated.Value)(0)),
        1000
      );
    }
  };

  const deleteUnsavedDownloadUrlsFromStorage = async (downloadURL: string) => {
    try {
      const decoded = decodeURIComponent(downloadURL);
      const path = decoded.substring(
        decoded.indexOf("/o/") + 3,
        decoded.indexOf("?")
      );
      const storagePath = path.replace(/%2F/g, "/");
      const imageRef = ref(getStorage(), storagePath);
      await deleteObject(imageRef);
    } catch (err) {
      console.error(
        "Image Uploaded to storage but download URL not saved to Firestore. So trying to delete from storage failed",
        err
      );
      throw err;
    }
  };

  // const removeImage = async (index: number) => {
  //   setLoading(true);
  //   try {
  //     const toDel = photos[index];
  //     if (toDel?.downloadURL) {
  //       await deleteUnsavedDownloadUrlsFromStorage(toDel.downloadURL);
  //     }
  //     const updated = photos.filter((_, i) => i !== index);
  //     if (!updated.some((p) => p.isPrimary) && updated.length)
  //       updated[0].isPrimary = true;
  //     setPhotos(updated);
  //     setIsEditing(true);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const saveProfileImageUrls = async () => {
  //   const urls = photos
  //     .map((p) => p.downloadURL || p.localUrl)
  //     .filter(Boolean) as string[];

  //   // Prefer context method which persists to server then AsyncStorage
  //   try {
  //     if (typeof updateProfileImages === "function") {
  //       await updateProfileImages(urls);
  //       return;
  //     }
  //   } catch (e) {
  //     console.error("updateProfileImages failed", e);
  //   }

  //   // Fallback: update local context and then server
  //   try {
  //     try {
  //       updateProfile?.({ images: urls } as any);
  //     } catch (e) {
  //       console.error("Failed to update local profile", e);
  //     }
  //     if (user?.uid)
  //       await profileService.updateProfile(user.uid, { images: urls });
  //   } catch (e) {
  //     console.error("Failed to update server profile images", e);
  //   }
  // };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary + "20", "transparent"]}
        style={styles.headerGradient}
      />

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <ImageIcon size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Photo Guidelines</Text>
            <Text style={styles.infoText}>
              • Upload up to {maxPhotos} high-quality photos{"\n"}• Avoid group
              photos or sunglasses
            </Text>
          </View>
        </View>

        <View style={styles.photosGrid}>
          {photos.map((photo, i) => renderPhotoSlot(photo, i))}
          {Array.from({ length: emptySlots }, (_, index) =>
            renderPhotoSlot(undefined, index)
          )}
        </View>

        <TouchableOpacity
          onPress={uploadImages}
          style={[
            styles.uploadButton,
            (!isEditing || loading) && { opacity: 0.6 },
          ]}
          disabled={!isEditing || loading}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? "Uploading..." : "Save Photos"}
          </Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Edit3 size={20} color={theme.colors.accent} />
          <Text style={styles.tipText}>
            Tap the star to set a photo as primary. Tap the X to delete a photo.
          </Text>
        </View>
      </View>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: "row",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  photoContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  photo: {
    width: photoSize,
    height: photoSize * 1.3,
    borderRadius: theme.borderRadius.lg,
  },
  emptyPhotoSlot: {
    width: photoSize,
    height: photoSize * 1.3,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  addPhotoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  primaryBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontSize: theme.fontSize.xs,
    fontWeight: "bold",
    marginLeft: theme.spacing.xs,
  },
  photoActions: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
  },
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
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "700",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  localRemoveButton: {
    position: "absolute",
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.danger,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonTextSmall: {
    color: "white",
    fontWeight: "700",
  },
});
