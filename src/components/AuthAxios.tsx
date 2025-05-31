import axios, { AxiosError } from "axios";

export const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Định nghĩa isAxiosError đúng theo kiểu TypeScript
export const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

let isInterceptorAttached = false;

if (!isInterceptorAttached) {
  authAxios.interceptors.request.use(
    (config) => {
      const cookies = document.cookie
        .split("; ")
        .map((cookie) => cookie.trim());
      let token = null;
      for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === "token") {
          token = value;
          break;
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Authorization header set:",
            config.headers.Authorization
          );
        }
      } else if (process.env.NODE_ENV === "development") {
        console.log("No token found in cookies");
      }
      return config;
    },
    (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Request interceptor error:", error);
      }
      return Promise.reject(error);
    }
  );
  isInterceptorAttached = true;
}

export default authAxios;
