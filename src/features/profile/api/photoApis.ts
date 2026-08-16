import { api } from "../../../services/api"; // Adjust import path to your api file

export interface PresignedUrlResponse {
  uploadUrl: string;
  finalPhotoUrl: string;
}

export interface PresignedThumbResponse {
  uploadUrl: string;
  finalThumbUrl: string;
}

// 🔹 Request presigned URL for main photo
export async function apiGenerateUploadUrl(): Promise<PresignedUrlResponse> {
  return await api.post<PresignedUrlResponse>("/photos/generate-upload-url");
}

// 🔹 Request presigned URL for thumbnail
export async function apiGenerateThumbUrl(): Promise<PresignedThumbResponse> {
  return await api.post<PresignedThumbResponse>("/photos/generate-thumb-url");
}

// 🔹 Delete photo from R2 via backend
export async function apiDeletePhoto(fileUrl: string): Promise<void> {
  await api.post("/photos/delete-photo", { fileUrl });
}
