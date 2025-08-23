import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";

const API_URL = "http://192.168.128.147:8000/api/v1" ;

interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// async function getAuthToken() {
//   console.log("Fetching auth token...");
//   return await AsyncStorage.getItem('auth_token');
// }
 async function getAuthToken() {
   const user = getAuth().currentUser;
   
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user.getIdToken();
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred');
  }
  
  return data;
}

export const api = {
 
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = await  getAuthToken();
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<T>(response);
  },
};
