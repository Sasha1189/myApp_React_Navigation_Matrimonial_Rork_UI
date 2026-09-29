import { api } from "@/services/api";

export interface PresignedDocUrlResponse {
  uploadUrl: string;
  finalDocUrl: string;
}

// 🔹 Request presigned URL for Doc
export async function apiGenerateDocUploadUrl(): Promise<PresignedDocUrlResponse> {
  return await api.post<PresignedDocUrlResponse>("/docs/generate-upload-url");
}
