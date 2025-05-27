import axios, { isAxiosError } from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://apicard.namident.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(
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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      isAxiosError(error) ? error.response?.data : error.message
    );
    return Promise.reject(error);
  }
);

// Export default instance và re-export isAxiosError
export default instance;
export { isAxiosError };
