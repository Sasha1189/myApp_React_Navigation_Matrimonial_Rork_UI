import { useState } from "react";
import { storage, refStorage, putFile } from "@/config/firebase";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { setUserVerification } from "../api/setUserVerification";

export interface SelectedDoc {
  uri: string;
  name: string;
  mimeType?: string;
}

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
      setSelectedDoc({
        uri: asset.uri,
        name: asset.name,
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
      // Extract extension or fallback to pdf
      const extension = selectedDoc.name.split(".").pop() || "pdf";
      const storagePath = `users/${uid}/ver_doc/vdoc_document.${extension}`;
      const reference = refStorage(storage, storagePath);

      // Upload file directly
      await putFile(reference, selectedDoc.uri);

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
