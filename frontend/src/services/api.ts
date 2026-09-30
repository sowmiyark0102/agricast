import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agricast_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function friendlyErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data?.message) return err.response.data.message as string;
    if (err.code === "ECONNABORTED" || !err.response) {
      return "We're having trouble connecting to the AgriCast service. Please check that the backend is running and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
