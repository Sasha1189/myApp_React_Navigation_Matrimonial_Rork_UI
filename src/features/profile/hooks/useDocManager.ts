import { useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { setUserVerification } from "../api/setUserVerification";
import { apiGenerateDocUploadUrl } from "../api/docApi";

export interface SelectedDoc {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// 👉 FILE SIZE CONFIGURATION (e.g., 5 MB max limit)
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function useDocManager() {
  const { user, isVerified, updateVerificationStatus } = useAuth();
  const { t } = useTranslation();
  const uid = user?.uid;

  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Pick a single document
  const pickDocument = async () => {
    if (isVerified !== "false") return; // Prevent picking if pending/verified

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"], // Accept PDFs and images
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;

      const asset = result.assets[0];

      // 👉 FILE SIZE VALIDATION: Reject files larger than MAX_FILE_SIZE_MB
      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          t("doc.fileTooLargeTitle", "File Too Large"),
          t(
            "doc.fileTooLargeMsg",
            `Please select a document smaller than ${MAX_FILE_SIZE_MB}MB.`,
          ),
        );
        return;
      }

      setSelectedDoc({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      });
    } catch (err) {
      console.error("Failed to pick document:", err);
      Alert.alert(t("common.error"), "Failed to pick document.");
    }
  };

  // 2. Remove document (Allowed ONLY before upload)
  const removeDocument = () => {
    if (isVerified !== "false") return;
    setSelectedDoc(null);
  };

  // 3. Upload directly to Firebase Storage without compression
  const uploadDocument = async () => {
    if (!selectedDoc) {
      Alert.alert(
        t("doc.addDocTitle", "Missing Document"),
        t("doc.addDocMsg", "Please select a document first."),
      );
      return;
    }

    if (!uid) {
      Alert.alert(t("common.error"), "User not authenticated.");
      return;
    }

    setLoading(true);

    try {
      // 👉 Step A: Convert local document URI into binary Blob
      const localRes = await fetch(selectedDoc.uri);
      const blob = await localRes.blob();

      // 👉 Secondary size validation check before starting upload
      if (blob.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          t("doc.fileTooLargeTitle", "File Too Large"),
          t(
            "doc.fileTooLargeMsg",
            `Document size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
          ),
        );
        setLoading(false);
        return;
      }

      // 👉 Step B: Request presigned upload URL from your API endpoint
      const { uploadUrl, finalDocUrl } = await apiGenerateDocUploadUrl();

      // 👉 Step C: Upload binary blob directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedDoc.mimeType || "application/pdf",
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        throw new Error(
          `R2 upload failed with HTTP status ${uploadRes.status}`,
        );
      }

      // Update backend / Firestore document path
      await setUserVerification(uid);

      // Instantly flip AuthContext to pending
      if (updateVerificationStatus) {
        updateVerificationStatus("pending");
      }

      Alert.alert(
        t("doc.successTitle", "Success"),
        t("doc.updateMsg", "Document uploaded for review."),
      );
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert(t("common.error"), "Document upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedDoc,
    loading,
    isVerified, // "true" | "pending" | "false"
    pickDocument,
    removeDocument,
    uploadDocument,
  };
}
