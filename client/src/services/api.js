import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Gunakan IP WiFi komputer Anda agar bisa diakses dari HP fisik maupun Emulator
const BASE_URL = 'http://192.168.1.8:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Interceptor untuk menyematkan Token secara otomatis pada setiap request yang membutuhkan autentikasi
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
