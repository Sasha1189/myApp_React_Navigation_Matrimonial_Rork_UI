import { useState, useEffect } from "react";
import { storage, refStorage, putFile, deleteObject } from "@/config/firebase";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { File } from "expo-file-system";
import { Profile, Photo } from "../types/profile";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { appStorage, IS_DOC_UPLOADED_CACHE_KEY } from "@/cacheMMKV/cacheConfig";
import { setDocPath } from "../api/docSetPathService";

const MAX_PHOTOS = 1;

export function useDocManager(profile: Profile | null) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const uid = user?.uid;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(() => {
    const cachedVer = appStorage.getBoolean(IS_DOC_UPLOADED_CACHE_KEY);
    return (cachedVer as boolean) || false;
  });

  useEffect(() => {
    if (profile?.iv) {
      setIsVerified(profile.iv);
    }
  }, [profile]);

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("photos.permissionTitle"), t("photos.permissionMsg"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    try {
      const newItem: Photo = {
        id: `local-${Date.now()}`,
        localUrl: uri,
        isPrimary: true,
      };

      setPhotos([newItem]);
    } catch (err) {
      console.error("Failed to add photo:", err);
      Alert.alert(t("photos.errorTitle"), t("photos.addError"));
    }
  };

  // const deletePhoto = async (photoId?: string) => {
  //   if (!uid) return;
  //   if (isVerified) return;

  //   Alert.alert(t("photos.deleteTitle"), t("photos.deleteMsg"));

  //   try {
  //     setLoading(true);

  //     const storagePath = `users/${uid}/ver_doc/vdoc_photo.jpg`;
  //     const photoRef = refStorage(storage, storagePath);

  //     await deleteObject(photoRef).catch(() => {});

  //     setPhotos([]);
  //     appStorage.set(IS_DOC_UPLOADED_CACHE_KEY, false);
  //     setIsUploaded(false);
  //   } catch (err) {
  //     console.error("Delete failed:", err);
  //     Alert.alert(t("photos.errorTitle"), t("photos.deleteError"));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const deletePhoto = async (photoId?: string) => {
    if (!uid || isVerified) return;

    Alert.alert(t("photos.deleteTitle"), t("photos.deleteMsg"), [
      {
        text: t("common.cancel", "Cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete", "Yes"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);

            const storagePath = `users/${uid}/ver_doc/vdoc_photo.jpg`;
            const photoRef = refStorage(storage, storagePath);

            await deleteObject(photoRef).catch(() => {});

            setPhotos([]);
            appStorage.set(IS_DOC_UPLOADED_CACHE_KEY, false);
            setIsUploaded(false);
          } catch (err) {
            console.error("Delete failed:", err);
            Alert.alert(t("photos.errorTitle"), t("photos.deleteError"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // 🔹 Upload single photo directly to Firebase Storage
  const uploadPhotos = async () => {
    const targetPhoto = photos[0];
    if (!targetPhoto?.localUrl) {
      Alert.alert(t("doc.addDocTitle"), t("doc.addDocMsg"));
      return;
    }

    const processed = await processImage(targetPhoto?.localUrl);

    if (!uid) {
      Alert.alert(t("photos.errorTitle"), "User not authenticated.");
      return;
    }

    setLoading(true);

    try {
      const storagePath = `users/${uid}/ver_doc/vdoc_photo.jpg`;
      const reference = refStorage(storage, storagePath);

      // Upload file directly to Storage
      const task = putFile(reference, processed);

      await task;

      appStorage.set(IS_DOC_UPLOADED_CACHE_KEY, true);
      setIsUploaded(true);
      setDocPath(uid);

      Alert.alert(t("photos.successTitle"), t("photos.updateMsg"));
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert(t("photos.errorTitle"), t("photos.uploadError"));
    } finally {
      setLoading(false);
    }
  };

  return {
    photos,
    setPhotos,
    loading,
    maxPhotos: MAX_PHOTOS,
    addPhoto,
    deletePhoto,
    uploadPhotos,
    isVerified,
    isUploaded,
  };
}

/* ------------------ Helpers ------------------ */

const MAX_SIZE_BYTES = 0.5 * 1024 * 1024; // 0.5 MB (524,288 Bytes)

const processImage = async (uri: string): Promise<string> => {
  const fileInfo = new File(uri);

  if (!fileInfo.exists) return uri;

  const currentSize = "size" in fileInfo ? fileInfo.size : 0;

  if (currentSize > 0 && currentSize <= MAX_SIZE_BYTES) {
    return uri;
  }

  const ratio = MAX_SIZE_BYTES / currentSize;

  const dimensionScale = Math.sqrt(ratio) * 0.9;
  const targetWidth = Math.max(360, Math.floor(1080 * dimensionScale));

  const compressQuality = Math.min(0.8, Math.max(0.3, ratio * 0.85));

  const processed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetWidth } }],
    {
      compress: compressQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return processed.uri;
};
