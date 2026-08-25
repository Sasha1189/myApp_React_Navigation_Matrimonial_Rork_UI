import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { Profile, Photo } from "../types/profile";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { apiDeletePhoto, apiGenerateUploadUrl } from "../api/photoApis"; // Or matching vdoc backend APIs
import { useMyProfile } from "../context/ProfileContext";

const MAX_DOC_SIZE_MB = 5;
const MAX_DOC_SIZE_BYTES = MAX_DOC_SIZE_MB * 1024 * 1024;

export function useDocManager(profile: Profile | null) {
  const { user } = useAuth();
  const { updateMyProfile } = useMyProfile();
  const { t } = useTranslation();
  const uid = user?.uid;

  const [docFile, setDocFile] = useState<Photo | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  // 1. Select Verification Document (Max 5MB, No Compression)
  const addDocPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("photos.permissionTitle"), t("photos.permissionMsg"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1, // Full resolution
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;

    try {
      // 🔹 Check file size using modern expo-file-system File API
      const fileInfo = new File(uri);
      const fileSize = fileInfo.size ?? 0;

      if (fileSize > MAX_DOC_SIZE_BYTES) {
        Alert.alert("File Too Large", "Document size must be less than 5MB.");
        return;
      }

      setDocFile({
        id: `local-doc-${Date.now()}`,
        localUrl: uri,
        downloadURL: "",
        isPrimary: false,
      });
    } catch (err) {
      Alert.alert("Error", "Could not read document size");
    }
  };

  // 2. Clear Selected Local Document / Delete Uploaded Doc
  const deleteDocPhoto = async () => {
    if (!docFile) return;

    // Local-only file deletion
    if (docFile.localUrl && !docFile.downloadURL) {
      setDocFile(null);
      return;
    }

    try {
      setDocLoading(true);
      if (docFile.downloadURL) {
        await apiDeletePhoto(docFile.downloadURL);
      }

      await updateMyProfile({
        // verificationDoc: null,
      });

      setDocFile(null);
      Alert.alert("Success", "Verification document removed.");
    } catch (err) {
      Alert.alert("Error", "Could not remove verification document.");
    } finally {
      setDocLoading(false);
    }
  };

  // 3. Upload Verification Document (users/{uid}/vdoc/file)
  const uploadDocPhoto = async () => {
    if (!docFile || docFile.downloadURL) return;
    if (!uid) return;

    setDocLoading(true);
    try {
      // A. Fetch local path directly as binary blob (No compression used)
      const localRes = await fetch(docFile.localUrl!);
      const blob = await localRes.blob();

      // B. Setup clean R2 upload parameters targeting users/{uid}/vdoc/
      const fileName = `vdoc_${Date.now()}.jpg`;
      const storagePath = `users/${uid}/vdoc/${fileName}`;

      // Request presigned link passing custom R2 bucket destination mapping path
      const { uploadUrl, finalPhotoUrl } = await apiGenerateUploadUrl();

      // C. Run standard PUT request upload directly to Cloudflare R2 bucket
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      if (!uploadRes.ok) throw new Error("R2 Document upload failed");

      // Shorten URL back down to filename structure for database safety
      const fileNameOnly = finalPhotoUrl.split("/").pop() || fileName;

      const updatedDoc: Photo = {
        ...docFile,
        downloadURL: fileNameOnly,
      };

      // D. Update profile in database context
      //   await updateMyProfile({
      //     verificationDoc: {
      //       id: updatedDoc.id,
      //       downloadURL: fileNameOnly,
      //       isPrimary: false,
      //     },
      //   });

      setDocFile(updatedDoc);
      Alert.alert("Success", "Document uploaded successfully for review!");
    } catch (err) {
      console.error(err);
      Alert.alert("Upload Error", "Failed to upload validation document.");
    } finally {
      setDocLoading(false);
    }
  };

  return {
    docFile,
    docLoading,
    addDocPhoto,
    deleteDocPhoto,
    uploadDocPhoto,
  };
}
