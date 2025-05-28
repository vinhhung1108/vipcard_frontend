"use client";
import axios, { isAxiosError, AxiosInstance } from "axios"; // Import isAxiosError từ axios

const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://apicard.namident.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

authAxios.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      isAxiosError(error) ? error.response?.data : error.message
    );
    return Promise.reject(error);
  }
);

export { authAxios, isAxiosError }; // Export cả authAxios và isAxiosError
export type { AxiosInstance }; // Export AxiosInstance để sử dụng nếu cần
