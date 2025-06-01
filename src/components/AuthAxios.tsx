import axios, { AxiosError } from "axios";

export const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

let isInterceptorAttached = false;

if (!isInterceptorAttached) {
  authAxios.interceptors.request.use(
    (config) => {
      // Nếu có token trong config (truyền từ Server Action), sử dụng token đó
      if (config.headers && config.headers["X-Authorization-Token"]) {
        config.headers.Authorization = `Bearer ${config.headers["X-Authorization-Token"]}`;
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Authorization header set from config:",
            config.headers.Authorization
          );
        }
        return config;
      }

      // Nếu không có token trong config, thử lấy từ document.cookie (chỉ client-side)
      if (typeof document !== "undefined") {
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
              "Authorization header set from cookie:",
              config.headers.Authorization
            );
          }
        } else if (process.env.NODE_ENV === "development") {
          console.log("No token found in cookies");
        }
      } else if (process.env.NODE_ENV === "development") {
        console.log("Running in server-side, document is not available");
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
