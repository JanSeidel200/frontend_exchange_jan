import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function checkHealth(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

export async function login(username: string, password: string) {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}