// src/api/auth.ts
import API from './axios';

export const registerUser = async (userData: any) => {
  const res = await API.post('/auth/register', userData);
  return res.data;
};

export const loginUser = async (userData: any) => {
  const res = await API.post('/auth/login', userData);
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post('/auth/logout');
  localStorage.removeItem('token');
  return res.data;
};

export const requestPasswordReset = async (email: string) => {
  const res = await API.post('/password-reset/request-reset', { email });
  return res.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await API.post('/password-reset/reset-password', data);
  return res.data;
};
