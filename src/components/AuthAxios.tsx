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
    const cookies = document.cookie.split("; ");
    let token = null;
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "token") {
        token = value;
        break; // Lấy token đầu tiên (sau khi đã xóa token cũ)
      }
    }
    console.log("Token from cookie:", token); // Debug
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set:", config.headers.Authorization);
    } else {
      console.log("No token found in cookie");
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
