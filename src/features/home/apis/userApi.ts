import { api } from "../../../services/api";

export interface CreateUserPayload {
  uid: string;
  phoneNumber: string;
  displayName: string;
}

export async function createUserOnBackend(payload: CreateUserPayload) {
  try {
    const res = await api.post(`/user/create-user`, payload);
    return res;
  } catch (error) {
    console.error("User creation failed:", error);
    throw error;
  }
}
