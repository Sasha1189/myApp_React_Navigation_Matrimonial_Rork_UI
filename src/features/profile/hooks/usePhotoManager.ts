import { useEffect, useState } from "react";
import { Alert } from "react-native";
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

import { Profile, Photo } from "../../../types/profile";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateProfileData } from "../hooks/useProfile";

const MAX_PHOTOS = 4;

export function usePhotoManager(profile: Profile | null) {
  const { user } = useAuth();
  const { mutateAsync: updateProfile } = useUpdateProfileData(
    profile?.uid ?? "",
    profile?.gender
  );

  const [photos, setPhotos] = useState<Photo[]>(profile?.photos || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
      Alert.alert("Permission required", "Please allow access to your gallery.");
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
      Alert.alert("Error", "Could not process image.");
    }
  };

  // 🔹 Delete photo (storage + db)
  const deletePhoto = async (photoId: string) => {
    const toDelete = photos.find((p) => p.id === photoId);
    if (!toDelete) return;

    try {
      if (toDelete.downloadURL) {
        const decoded = decodeURIComponent(toDelete.downloadURL);
        const path = decoded.substring(
          decoded.indexOf("/o/") + 3,
          decoded.indexOf("?")
        );
        const storagePath = path.replace(/%2F/g, "/");
        const imageRef = ref(getStorage(), storagePath);
        await deleteObject(imageRef);
      }

      const updated = photos.filter((p) => p.id !== photoId);
      if (!updated.some((p) => p.isPrimary) && updated.length) {
        updated[0].isPrimary = true;
      }
      setPhotos(updated);

      await updateProfile({ photos: updated });

      Alert.alert("Deleted", "Photo removed successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete photo. Try again.");
    }
  };

  // 🔹 Set primary
  const setPrimary = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, isPrimary: p.id === photoId }))
    );
    setIsEditing(true);
  };

  // 🔹 Upload pending (local only) photos
  const uploadPhotos = async () => {
    const pending = photos.filter((p) => !p.downloadURL);
    if (!pending.length) {
      Alert.alert("No Changes", "Nothing new to upload.");
      return;
    }

    setLoading(true);

    try {
      const storage = getStorage();
      const updatedPhotos = [...photos];

      for (let p of pending) {
        const uniqueFilename = `IMG_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}.jpg`;
        const storageRef = ref(
          storage,
          `users/${user?.uid}/profileImages/${uniqueFilename}`
        );

        const blob = await uriToBlob(p.localUrl!);

        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, blob as any);

          task.on(
            "state_changed",
            undefined,
            (err) => reject(err),
            async () => {
              const downloadURL = await getDownloadURL(task.snapshot.ref);
              const idx = updatedPhotos.findIndex((x) => x.id === p.id);
              if (idx !== -1) {
                updatedPhotos[idx].downloadURL = downloadURL;
              }
              resolve();
            }
          );
        });
      }

      setPhotos(updatedPhotos);
      await updateProfile({ photos: updatedPhotos });

      Alert.alert("Success", "Photos updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Upload failed:", err);
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
    maxPhotos: MAX_PHOTOS,
    addPhoto,
    deletePhoto,
    setPrimary,
    uploadPhotos,
  };
}

/* ------------------ Helpers ------------------ */

const processImage = async (uri: string) => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (
    !fileInfo.exists ||
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
  return await res.blob();
};