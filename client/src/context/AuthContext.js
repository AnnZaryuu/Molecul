import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      setUserToken('GUEST');
      await AsyncStorage.setItem('userToken', 'GUEST');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (name, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { name, password });
      if (response.data.access_token) {
        setUserToken(response.data.access_token);
        setUserInfo(response.data.user);
        await AsyncStorage.setItem('userToken', response.data.access_token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/register', { name, password });
      if (response.data.access_token) {
        setUserToken(response.data.access_token);
        setUserInfo(response.data.user);
        await AsyncStorage.setItem('userToken', response.data.access_token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Register error:', error.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/logout'); // Hapus token di sisi server
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Selalu hapus data lokal meskipun server gagal
      setUserToken(null);
      setUserInfo(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsLoading(false);
    }
  };

  const fetchProfile = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await api.get('/user');
      setUserInfo(response.data);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
    if (showLoading) setIsLoading(false);
  };

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      let user = await AsyncStorage.getItem('userInfo');
      
      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
    } catch (error) {
      console.log('Cek Login Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Live polling for profile updates (coins)
  useEffect(() => {
    let interval;
    if (userToken && userToken !== 'GUEST') {
      interval = setInterval(() => {
        fetchProfile(false); // Silent fetch, no loading state to avoid UI flicker
      }, 15000); // 15 seconds
    }
    return () => clearInterval(interval);
  }, [userToken]);

  return (
    <AuthContext.Provider value={{ login, logout, register, loginAsGuest, fetchProfile, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
