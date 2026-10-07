import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";
import { Profile } from "../types/profile";
import { useAuth } from "@/context";
import { useMyProfile } from "../context/ProfileContext";
import { useTranslation } from "react-i18next";
import {
  apiDeletePhoto,
  apiGenerateUploadUrl,
  apiGenerateThumbUrl,
} from "../api/photoApis";
import { resolveThumbUri, isLocalUrl } from "@/utils/photoUtils";

const MAX_PHOTOS = 4;

export function usePhotoManager(profile: Profile | null) {
  const { user, isPaid } = useAuth();
  const { updateMyProfile } = useMyProfile();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const userId = user?.uid || "";

  useEffect(() => {
    if (profile?.photos) {
      setPhotos(profile.photos);
    }
  }, [profile]);

  // 🔹 Add new photo (UNCHANGED)
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
      const processedUri = await processImage(uri);
      setPhotos((prev) => [...prev, processedUri].slice(0, MAX_PHOTOS));
      setIsEditing(true);
    } catch (err) {
      Alert.alert(t("photos.errorTitle"), t("photos.addError"));
    }
  };

  // 🔹 Delete photo (storage + db) -> UPDATED FOR R2 WITH CONFIRMATION
  const deletePhoto = async (targetPhoto: string) => {
    const photoIndex = photos.indexOf(targetPhoto);
    if (photoIndex === -1) return;

    Alert.alert(t("photos.deleteTitle"), t("photos.deleteMsg"), [
      {
        text: t("common.cancel", "Cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete", "Yes"),
        style: "destructive",
        onPress: async () => {
          if (isLocalUrl(targetPhoto)) {
            setPhotos((prev) => prev.filter((p) => p !== targetPhoto));
            return;
          }

          try {
            await apiDeletePhoto(targetPhoto);

            const updated = photos.filter((p) => p !== targetPhoto);

            await updateMyProfile({
              photos: updated,
            });

            setPhotos(updated);
            Alert.alert(t("photos.deleteTitle"), t("photos.deleteMsg"));
          } catch (err) {
            console.error("Delete failed:", err);
            Alert.alert(t("photos.errorTitle"), t("photos.deleteError"));
          }
        },
      },
    ]);
  };

  // 🔹 Set primary (UNCHANGED)
  const setPrimary = async (targetPhoto: string) => {
    const photoIndex = photos.indexOf(targetPhoto);
    if (photoIndex <= 0) return;

    const reorderedPhotos = [
      targetPhoto,
      ...photos.filter((p) => p !== targetPhoto),
    ];

    setPhotos(reorderedPhotos);
    setIsEditing(true);

    setLoading(true);
    try {
      await updateMyProfile({
        photos: reorderedPhotos,
      });
      setIsEditing(false);
      Alert.alert(t("photos.successTitle"), t("photos.updateMsg"));
    } catch (err) {
      console.error("Set primary failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Upload pending (local only) photos -> UPDATED FOR R2
  const uploadPhotos = async () => {
    const pending = photos.filter((p) => isLocalUrl(p));
    if (!pending.length) {
      Alert.alert(t("photos.noChangesTitle"), t("photos.noChangesMsg"));
      return;
    }

    if (!isPaid) {
      setLoading(true);
      try {
        await updateMyProfile({
          photos: photos,
          tn: photos[0] || "",
        });
        setIsEditing(false);
        Alert.alert(
          t("photos.successTitle"),
          t("photos.localSaveMsg", "Saved to your device!"),
        );
      } catch (err) {
        Alert.alert(t("photos.errorTitle"), t("photos.saveError"));
      } finally {
        setLoading(false);
      }
      return;
    }

    const backupPhotos = [...photos];
    setLoading(true);
    setProgress(0);
    setSuccess(false);

    const uploadedUrls: string[] = [];

    try {
      const updatedPhotos = [...photos];
      let rootThumbnail = profile?.tn || 0;
      const totalFiles = pending.length;
      let filesCompleted = 0;

      for (let p of pending) {
        const processed = await processImage(p);

        // A. Convert local image to Blob
        const localRes = await fetch(processed);
        const blob = await localRes.blob();

        // B. Get Presigned URL using your API client
        const { uploadUrl, finalPhotoUrl, fileName } =
          await apiGenerateUploadUrl();

        // C. Upload Binary directly to R2
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });

        if (!uploadRes.ok) throw new Error("R2 Upload failed");

        // Save full URL to rollback list in case DB update fails later
        uploadedUrls.push(finalPhotoUrl);
        filesCompleted++;
        setProgress((filesCompleted / totalFiles) * 100);

        // D. Update local state array with FILENAME ONLY
        const idx = updatedPhotos.indexOf(p);
        if (idx !== -1) {
          updatedPhotos[idx] = fileName;

          // if (idx === 0) {
          //   const tv = await syncPrimaryThumbnail(updatedPhotos[0], userId);
          //   rootThumbnail = tv;
          // }
        }
      }

      try {
        // Save to db (only containing filenames)
        await updateMyProfile({
          photos: updatedPhotos,
        });

        setPhotos(updatedPhotos);
        setSuccess(true);
        setProgress(100);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
        Alert.alert(t("photos.successTitle"), t("photos.updateMsg"));
      } catch (dbErr) {
        console.error("db Update Failed. Cleaning R2...", dbErr);
        await Promise.all(
          uploadedUrls.map((url) => apiDeletePhoto(url).catch(() => {})),
        );
        throw new Error("Database Sync Failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(0);
      setSuccess(false);
      setPhotos(backupPhotos);
      Alert.alert(t("photos.errorTitle"), t("photos.uploadError"));
    } finally {
      setLoading(false);
    }
  };

  return {
    photos,
    setPhotos,
    isEditing,
    setIsEditing,
    loading,
    progress,
    success,
    maxPhotos: MAX_PHOTOS,
    addPhoto,
    deletePhoto,
    setPrimary,
    uploadPhotos,
  };
}

/* ------------------ Helpers ------------------ */

// 🔹 Process Image (UNCHANGED)
const processImage = async (uri: string) => {
  const fileInfo = new File(uri);

  if (!fileInfo.exists) return uri;
  const currentSize = "size" in fileInfo ? fileInfo.size : 0;

  const TARGET_SIZE_MB = 0.3;
  const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

  const manipOptions = [{ resize: { width: 1080 } }];

  let finalCompress = 0.7;
  if (currentSize > TARGET_SIZE_BYTES) {
    const ratio = (TARGET_SIZE_BYTES / currentSize) * 1.2;
    finalCompress = Math.min(Math.max(ratio, 0.5), 0.8);
  }

  const compression = finalCompress;

  const processed = await ImageManipulator.manipulateAsync(uri, manipOptions, {
    compress: compression,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return processed.uri;
};

// 🔹 Sync Primary Thumbnail -> UPDATED FOR R2
const syncPrimaryThumbnail = async (
  primaryPhoto: string,
  uid: string,
): Promise<number> => {
  if (uid || !primaryPhoto)
    throw new Error("No source image found for thumbnail");

  let sourceUri = isLocalUrl(primaryPhoto)
    ? primaryPhoto
    : resolveThumbUri(primaryPhoto, uid);

  if (!sourceUri) {
    const downloadedFile = await File.downloadFileAsync(
      primaryPhoto,
      Paths.cache,
    );
    sourceUri = downloadedFile.uri;
  }

  if (!sourceUri) throw new Error("No source image found for thumbnail");

  // 1. Process thumbnail image
  const processedThumb = await processImage(sourceUri);

  // 2. Convert to Blob
  const localRes = await fetch(processedThumb);
  const blob = await localRes.blob();

  // 3. Get Presigned URL using your API client
  const { uploadUrl, tv } = await apiGenerateThumbUrl();

  // 4. Upload raw blob to R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });

  if (!uploadRes.ok) throw new Error("R2 Thumbnail Upload failed");

  return tv;
};
