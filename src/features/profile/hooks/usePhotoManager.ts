import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";
import { Profile, Photo } from "../types/profile";
import { useAuth } from "../../../context/AuthContext";
import { useMyProfile } from "../context/ProfileContext";
import { useTranslation } from "react-i18next";
import {
  apiDeletePhoto,
  apiGenerateUploadUrl,
  apiGenerateThumbUrl,
} from "../api/photoApis";

const MAX_PHOTOS = 4;

export function usePhotoManager(profile: Profile | null) {
  const { user, tier } = useAuth();
  const { updateMyProfile } = useMyProfile();
  const { t } = useTranslation();
  const uid = user?.uid;
  const [photos, setPhotos] = useState<Photo[]>(profile?.photos || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const isPaid = tier === "basic" || tier === "premium";

  // keep photos in sync with profile updates
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
      const newItem: Photo = {
        id: `local-${Date.now()}`,
        localUrl: processedUri,
        downloadURL: "",
        isPrimary: photos.length === 0,
      };

      setPhotos((prev) => [...prev, newItem].slice(0, MAX_PHOTOS));
      setIsEditing(true);
    } catch (err) {
      Alert.alert(t("photos.errorTitle"), t("photos.addError"));
    }
  };

  // 🔹 Delete photo (storage + db) -> UPDATED FOR R2
  const deletePhoto = async (photoId: string) => {
    const toDelete = photos.find((p) => p.id === photoId);
    if (!toDelete) return;

    // Case: Only exists locally (not uploaded yet)
    if (toDelete.localUrl && !toDelete.downloadURL) {
      setPhotos(photos.filter((p) => p.id !== photoId));
      return;
    }

    try {
      // 1. Modular Delete from R2 via Backend
      if (toDelete.downloadURL) {
        // We assume the downloadURL looks like: https://r2-domain.com/users/123/file.jpg
        // We pass the full URL to the backend, which will parse out the key and delete it
        // await fetch(`${API_BASE_URL}/delete-photo`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ fileUrl: toDelete.downloadURL, uid }),
        // });
        await apiDeletePhoto(toDelete.downloadURL);
      }

      // 2. Filter local list
      const updated = photos.filter((p) => p.id !== photoId);
      let newRootThumbnail = profile?.tn || "";

      // 3. Handle Primary Promotion
      if (toDelete.isPrimary) {
        if (updated.length > 0) {
          // Promote the next photo in line as primary
          newRootThumbnail = await syncPrimaryThumbnail(updated[0], uid!);
        } else {
          // No photos left
          newRootThumbnail = "";
        }
      }

      // 4. Update Database (Firestore/RTDB)
      const cleanPhotosForDb = updated.map(({ localUrl, ...rest }) => rest);
      await updateMyProfile({
        photos: cleanPhotosForDb,
        tn: newRootThumbnail,
      });

      setPhotos(updated);
      Alert.alert(t("photos.deleteTitle"), t("photos.deleteMsg"));
    } catch (err) {
      Alert.alert(t("photos.errorTitle"), t("photos.deleteError"));
    }
  };

  // 🔹 Set primary (UNCHANGED)
  const setPrimary = async (photoId: string) => {
    setLoading(true);
    try {
      const selectedPhoto = photos.find((p) => p.id === photoId);
      if (!selectedPhoto) return;

      const otherPhotos = photos.filter((p) => p.id !== photoId);

      const updatedPhotos = [
        { ...selectedPhoto, isPrimary: true }, // Put selected at index 0
        ...otherPhotos.map((p) => ({ ...p, isPrimary: false })), // Reset others
      ];

      // 2. 🔹 CALL HELPER
      const newThumbnail = await syncPrimaryThumbnail(updatedPhotos[0], uid!);

      // 4. Update Database
      const cleanPhotosForDb = updatedPhotos.map(
        ({ localUrl, ...rest }) => rest,
      );
      await updateMyProfile({
        photos: cleanPhotosForDb,
        tn: newThumbnail,
      });
      setPhotos(updatedPhotos);
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
    const pending = photos.filter((p) => !p.downloadURL);
    if (!pending.length) {
      Alert.alert(t("photos.noChangesTitle"), t("photos.noChangesMsg"));
      return;
    }

    if (!isPaid) {
      setLoading(true);
      try {
        await updateMyProfile({
          photos: photos,
          tn: photos.find((p) => p.isPrimary)?.localUrl || "",
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

    const backupPhotos = structuredClone(photos);
    setLoading(true);
    setProgress(0);
    setSuccess(false);

    // Keep full URLs in this array for the cleanup rollback step
    const uploadedUrls: string[] = [];

    try {
      const updatedPhotos = [...photos];
      let rootThumbnail = profile?.tn || "";
      const totalFiles = pending.length;
      let filesCompleted = 0;

      for (let p of pending) {
        const processed = await processImage(p.localUrl!, "photo");

        // A. Convert local image to Blob
        const localRes = await fetch(processed);
        const blob = await localRes.blob();

        // B. Get Presigned URL using your API client
        const { uploadUrl, finalPhotoUrl } = await apiGenerateUploadUrl();

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

        // 🔹 EXTRACT FILENAME ONLY (e.g. "1710000000000_1.jpg")
        const fileNameOnly = finalPhotoUrl.split("/").pop() || "";

        // D. Update local state array with FILENAME ONLY
        const idx = updatedPhotos.findIndex((x) => x.id === p.id);
        if (idx !== -1) {
          updatedPhotos[idx].downloadURL = fileNameOnly;

          if (idx === 0) {
            const rawThumbUrl = await syncPrimaryThumbnail(
              updatedPhotos[0],
              uid!,
            );
            // Extract filename for thumbnail if you want it shortened as well
            rootThumbnail = rawThumbUrl.split("/").pop() || rawThumbUrl;
          }
        }
      }

      try {
        const cleanPhotosForDb = updatedPhotos.map(
          ({ localUrl, ...rest }) => rest,
        );

        // Save to Firestore (only containing filenames in downloadURL)
        await updateMyProfile({
          photos: cleanPhotosForDb,
          tn: rootThumbnail,
        });

        setPhotos(updatedPhotos);
        setSuccess(true);
        setProgress(100);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
        Alert.alert(t("photos.successTitle"), t("photos.updateMsg"));
      } catch (dbErr) {
        console.error("Firestore Update Failed. Cleaning R2...", dbErr);

        // Rollback: delete full photo URLs from R2
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
const processImage = async (uri: string, type: "photo" | "thumb" = "photo") => {
  const isThumb = type === "thumb";
  const fileInfo = new File(uri);

  if (!fileInfo.exists) return uri;
  const currentSize = "size" in fileInfo ? fileInfo.size : 0;

  const TARGET_SIZE_MB = 0.3;
  const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

  const manipOptions = isThumb
    ? [{ resize: { width: 150 } }]
    : [{ resize: { width: 1080 } }];

  let finalCompress = 0.7;
  if (currentSize > TARGET_SIZE_BYTES) {
    const ratio = (TARGET_SIZE_BYTES / currentSize) * 1.2;
    finalCompress = Math.min(Math.max(ratio, 0.5), 0.8);
  }

  const compression = isThumb ? 0.5 : finalCompress;

  const processed = await ImageManipulator.manipulateAsync(uri, manipOptions, {
    compress: compression,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return processed.uri;
};

// 🔹 Sync Primary Thumbnail -> UPDATED FOR R2
const syncPrimaryThumbnail = async (
  primaryPhoto: Photo,
  uid: string,
): Promise<string> => {
  let sourceUri = primaryPhoto.localUrl;

  if (!sourceUri && primaryPhoto.downloadURL) {
    const downloadedFile = await File.downloadFileAsync(
      primaryPhoto.downloadURL,
      Paths.cache,
    );
    sourceUri = downloadedFile.uri;
  }

  if (!sourceUri) throw new Error("No source image found for thumbnail");

  // 1. Process thumbnail image
  const processedThumb = await processImage(sourceUri, "thumb");

  // 2. Convert to Blob
  const localRes = await fetch(processedThumb);
  const blob = await localRes.blob();

  // 3. Get Presigned URL using your API client
  const { uploadUrl, finalThumbUrl } = await apiGenerateThumbUrl();

  // 4. Upload raw blob to R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });

  if (!uploadRes.ok) throw new Error("R2 Thumbnail Upload failed");

  return finalThumbUrl;
};
