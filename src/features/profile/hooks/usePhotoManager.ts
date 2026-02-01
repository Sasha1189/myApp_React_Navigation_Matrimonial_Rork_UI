import { useEffect, useState } from "react";
import storage, { firebase } from '@react-native-firebase/storage';
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

import { Profile, Photo, DBPhoto } from "../../../types/profile";
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
        const imageRef = storage().refFromURL(toDelete.downloadURL);
        await imageRef.delete();
      }

      const updated = photos.filter((p) => p.id !== photoId);
      if (!updated.some((p) => p.isPrimary) && updated.length) {
        updated[0].isPrimary = true;
      }
      setPhotos(updated);

      await updateProfile({ photos: updated });

      Alert.alert("Deleted", "Photo removed successfully.");
      setIsEditing(false);
    } catch (err: any) {
      // 🔹 UPDATED: Specific log for auth issues
      console.error("Delete failed:", err);
      if (err.code === 'storage/unauthorized') {
        Alert.alert("Permission Denied", "You don't have permission to delete this file. Check Storage Rules.");
      } else {
        Alert.alert("Error", "Failed to delete photo. Try again.");
      }
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
      // const storage = getStorage();
      const updatedPhotos = [...photos];

      for (let p of pending) {
       const uniqueFilename = `IMG_${Date.now()}.jpg`;
        const path = `users/${user?.uid}/profileImages/${uniqueFilename}`;
        
        // 3. CHANGE: Use putFile() with the local URI directly
        // No need for uriToBlob or manual Tasks
         const reference = storage().ref(path);
        await reference.putFile(p.localUrl!); 
        
        // 4. Get the URL
        const downloadURL = await reference.getDownloadURL();
        
        const idx = updatedPhotos.findIndex((x) => x.id === p.id);
        if (idx !== -1) {
          updatedPhotos[idx].downloadURL = downloadURL;
        }
      }

      await updateProfile({ photos: updatedPhotos });
      setPhotos(updatedPhotos);

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
  // 🔹 Industry Standard: 300KB is plenty for mobile high-quality photos
  const TARGET_SIZE_MB = 0.3; 
  const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024; 

  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) return uri;
  const currentSize = 'size' in fileInfo ? fileInfo.size : 0;

  // 🔹 Step 1: Always resize to a max width. 
  // Mobile screens rarely need more than 1080px. 
  // This drastically reduces file size before we even touch compression.
  const manipOptions = [{ resize: { width: 1080 } }];

  // 🔹 Step 2: Calculate compression
  let finalCompress = 0.8; // Default high quality
  if (currentSize > TARGET_SIZE_BYTES) {
    // If it's still too big, calculate ratio
    const ratio = (TARGET_SIZE_BYTES / currentSize) * 1.2; // 1.2 buffer because resizing already helped
    finalCompress = Math.min(Math.max(ratio, 0.5), 0.8); 
  }

  const processed = await ImageManipulator.manipulateAsync(
    uri,
    manipOptions,
    {
      compress: finalCompress,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return processed.uri;
};