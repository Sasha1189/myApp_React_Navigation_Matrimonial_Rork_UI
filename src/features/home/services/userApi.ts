import { api } from "../../../services/api";
import { firestore, doc, setDoc, getDoc } from "@/config/firebase";

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
    throw error;
  }
}
