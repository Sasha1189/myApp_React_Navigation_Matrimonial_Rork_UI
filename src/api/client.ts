import axios from 'axios';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.yuvanetwork.com';

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  async (config) => {
    const token = await storage.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await storage.remove('auth_token');
      // You might want to trigger a logout action here
    }
    logger.error('API Response Error:', error);
    return Promise.reject(error);
  }
);
