import { getAuth } from "firebase/auth";

const API_URL = "http://192.168.1.104:8000/api/v1";

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

async function getAuthToken(): Promise<string | null> {
  const user = getAuth().currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken();
}

function buildHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Handle 204 No Content
  if (response.status === 204) {
    return null as unknown as T;
  }

  // Try to parse JSON; fall back to text if parsing fails
  let text: string | null = null;
  try {
    text = await response.text();
  } catch (e) {
    // ignore
  }

  let parsed: any = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // not JSON, keep raw text
      parsed = text;
    }
  }

  if (!response.ok) {
    const message = parsed && typeof parsed === 'object' ? parsed.message ?? parsed.error : String(parsed ?? 'An error occurred');
    throw new ApiError(response.status, message);
  }

  // Return parsed JSON when possible, otherwise return raw text or null
  return (parsed ?? null) as T;
}

export const api = {
  async get<T>(endpoint: string, params?: Record<string, any>, timeout = 15000): Promise<T> {
    const token = await getAuthToken();
    const url = new URL(`${API_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
          // Append multiple values for same key
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        headers: buildHeaders(token),
        signal: controller.signal,
      });

      return await handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  },

  async post<T>(endpoint: string, data?: any, timeout = 15000): Promise<T> {
    const token = await getAuthToken();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: buildHeaders(token),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      return await handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  },

  async put<T>(endpoint: string, data: any, timeout = 15000): Promise<T> {
    const token = await getAuthToken();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: buildHeaders(token),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      return await handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  },

  async delete<T>(endpoint: string, timeout = 15000): Promise<T> {
    const token = await getAuthToken();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: buildHeaders(token),
        signal: controller.signal,
      });

      return await handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  },
};

//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         url.searchParams.append(key, value);
//       });
//     }

//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);

//     try {
//       const response = await fetch(url.toString(), {
//         headers: buildHeaders(token),
//         signal: controller.signal,
//       });

//       return await handleResponse<T>(response);
//     } finally {
//       clearTimeout(id);
//     }
//   },

//   async post<T>(endpoint: string, data?: any, timeout = 15000): Promise<T> {
//     const token = await getAuthToken();
//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);

//     try {
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         method: 'POST',
//         headers: buildHeaders(token),
//         body: data ? JSON.stringify(data) : undefined,
//         signal: controller.signal,
//       });

//       return await handleResponse<T>(response);
//     } finally {
//       clearTimeout(id);
//     }
//   },

//   async put<T>(endpoint: string, data: any, timeout = 15000): Promise<T> {
//     const token = await getAuthToken();
//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);

//     try {
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         method: 'PUT',
//         headers: buildHeaders(token),
//         body: JSON.stringify(data),
//         signal: controller.signal,
//       });

//       return await handleResponse<T>(response);
//     } finally {
//       clearTimeout(id);
//     }
//   },

//   async delete<T>(endpoint: string, timeout = 15000): Promise<T> {
//     const token = await getAuthToken();
//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);

//     try {
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         method: 'DELETE',
//         headers: buildHeaders(token),
//         signal: controller.signal,
//       });

//       return await handleResponse<T>(response);
//     } finally {
//       clearTimeout(id);
//     }
//   },
// };
