import { api } from "../../../services/api";

export async function fetchChats() {
  return api.get("/chats"); // GET request to /api/v1/chats
}
