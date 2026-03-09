import { useState, useEffect } from "react";
import {
  storage,
  refStorage,
  getDownloadURL,
  putFile,
  refFromURL,
  deleteObject,
} from "@/config/firebase";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";
import { Profile, Photo } from "../../../types/profile";
import { useAuth } from "../../../context/AuthContext";

const MAX_PHOTOS = 4;

export function usePhotoManager(profile: Profile | null) {
  const { user, updateProfile } = useAuth();
  const uid = user?.uid;
  const [photos, setPhotos] = useState<Photo[]>(profile?.photos || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // keep photos in sync with profile updates
  useEffect(() => {
    if (profile?.photos) {
      setPhotos(profile.photos);
    }
  }, [profile]);

  // 🔹 Add new photo
  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your gallery.",
      );
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
      console.error("Failed to add photo:", err);
      Alert.alert("Error", "Could not add image.");
    }
  };

  // 🔹 Delete photo (storage + db)
  const deletePhoto = async (photoId: string) => {
    const toDelete = photos.find((p) => p.id === photoId);
    if (!toDelete) return;

    // Case: Only exists locally (not uploaded yet)
    if (toDelete.localUrl && !toDelete.downloadURL) {
      setPhotos(photos.filter((p) => p.id !== photoId));
      return;
    }

    try {
      // 1. Modular Delete from Storage
      if (toDelete.downloadURL) {
        const imageRef = refFromURL(storage, toDelete.downloadURL);
        await deleteObject(imageRef);
      }

      // 2. Filter local list
      const updated = photos.filter((p) => p.id !== photoId);
      let newRootThumbnail = profile?.thumbnail || "";

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
      await updateProfile({
        photos: cleanPhotosForDb,
        thumbnail: newRootThumbnail,
      });

      setPhotos(updated);
      Alert.alert("Deleted", "Photo removed successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete photo.");
    }
  };

  // 🔹 Set primary
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
      await updateProfile({
        photos: cleanPhotosForDb,
        thumbnail: newThumbnail,
      });
      setPhotos(updatedPhotos);
      setIsEditing(false);
      Alert.alert("Success", "Photos updated successfully!");
    } catch (err) {
      console.error("Set primary failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Upload pending (local only) photos
  const uploadPhotos = async () => {
    const pending = photos.filter((p) => !p.downloadURL);
    if (!pending.length) {
      Alert.alert("No Changes", "Nothing new to upload.");
      return;
    }

    const backupPhotos = structuredClone(photos);

    setLoading(true);
    setProgress(0);
    setSuccess(false);

    const uploadedRefs: any[] = [];

    try {
      const updatedPhotos = [...photos];
      let rootThumbnail = profile?.thumbnail || "";

      const totalFiles = pending.length;
      let filesCompleted = 0;

      for (let p of pending) {
        const processed = await processImage(p.localUrl!, "photo");
        const uniqueFilename = `IMG_${Date.now()}.jpg`;
        const path = `users/${user?.uid}/profileImages/${uniqueFilename}`;

        const reference = refStorage(storage, path);
        uploadedRefs.push(reference);

        const task = putFile(reference, processed);

        task.on("state_changed", (taskSnapshot) => {
          const fileProgress =
            (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
          const totalPercent =
            (filesCompleted * 100 + fileProgress) / totalFiles;
          setProgress(totalPercent);
        });

        await task;
        filesCompleted++;

        const downloadURL = await getDownloadURL(reference);

        const idx = updatedPhotos.findIndex((x) => x.id === p.id);
        if (idx !== -1) {
          updatedPhotos[idx].downloadURL = downloadURL;
          if (idx === 0) {
            console.log(
              "📸 Syncing root thumbnail because Index 0 was updated...",
            );
            rootThumbnail = await syncPrimaryThumbnail(updatedPhotos[0], uid!);
          }
        }
      }

      try {
        const cleanPhotosForDb = updatedPhotos.map(
          ({ localUrl, ...rest }) => rest,
        );
        await updateProfile({
          photos: cleanPhotosForDb,
          thumbnail: rootThumbnail,
        });
        setPhotos(updatedPhotos);
        setSuccess(true);
        setProgress(100);
        setIsEditing(false);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
        Alert.alert("Success", "Photos updated successfully!");
      } catch (dbErr) {
        console.error("Firestore Update Failed. Cleaning storage...", dbErr);
        await Promise.all(
          uploadedRefs.map((ref) => ref.delete().catch(() => {})),
        );
        throw new Error("Database Sync Failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(0);
      setSuccess(false);
      setPhotos(backupPhotos);
      Alert.alert("Error", "Failed to upload photos.");
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

const processImage = async (uri: string, type: "photo" | "thumb" = "photo") => {
  const isThumb = type === "thumb";
  const fileInfo = new File(uri);

  if (!fileInfo.exists) return uri;
  const currentSize = "size" in fileInfo ? fileInfo.size : 0;

  const TARGET_SIZE_MB = 0.3;
  const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

  // 🔹 Step 1: Always resize to a max width.
  // Mobile screens rarely need more than 1080px.
  const manipOptions = isThumb
    ? [{ resize: { width: 150 } }] // Tiny for lists (avatar/messages)
    : [{ resize: { width: 1080 } }]; // High quality for profile page

  // 🔹 Step 2: Calculate compression
  let finalCompress = 0.7; // Default high quality
  if (currentSize > TARGET_SIZE_BYTES) {
    // If it's still too big, calculate ratio
    const ratio = (TARGET_SIZE_BYTES / currentSize) * 1.2; // 1.2 buffer because resizing already helped
    finalCompress = Math.min(Math.max(ratio, 0.5), 0.8);
  }

  const compression = isThumb ? 0.5 : finalCompress;

  const processed = await ImageManipulator.manipulateAsync(uri, manipOptions, {
    compress: compression,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return processed.uri;
};

const syncPrimaryThumbnail = async (
  primaryPhoto: Photo,
  uid: string,
): Promise<string> => {
  // 1. Determine Source (Priority: Local > Remote)
  let sourceUri = primaryPhoto.localUrl;

  if (!sourceUri && primaryPhoto.downloadURL) {
    const downloadedFile = await File.downloadFileAsync(
      primaryPhoto.downloadURL,
      Paths.cache,
    );
    sourceUri = downloadedFile.uri;
  }

  if (!sourceUri) throw new Error("No source image found for thumbnail");

  // 2. Process: Resize to 150px (Standard for your app)
  const processedThumb = await processImage(sourceUri, "thumb");
  const thumbPath = `users/${uid}/thumbnail/thumb.jpg`;

  const thumbRef = refStorage(storage, thumbPath);

  await putFile(thumbRef, processedThumb);

  return await getDownloadURL(thumbRef);
};
