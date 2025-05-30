import axios from "axios";

export const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const isAxiosError = axios.isAxiosError;

let isInterceptorAttached = false;

if (!isInterceptorAttached) {
  authAxios.interceptors.request.use(
    (config) => {
      const cookies = document.cookie.split("; ");
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
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  isInterceptorAttached = true;
}

export default authAxios;
