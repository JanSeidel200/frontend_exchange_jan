import axios from "axios";

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  CurrencyOption,
  UserSettings,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "exchange_auth_token";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function checkHealth(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

export async function login(username: string, password: string) {
  const response = await api.post<{
    username: string;
    message: string;
    access_token: string;
  }>("/auth/login", { username, password });
  if (response.data.access_token) {
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
  }
  return response.data;
}

export async function logout() {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function getCurrencies(): Promise<CurrencyOption[]> {
  const response = await api.get<CurrencyOption[]>("/currency/currencies");
  return response.data;
}

export async function analyzeRates(
  payload: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const response = await api.post<AnalyzeResponse>(
    "/currency/analyze",
    payload,
  );
  return response.data;
}

export async function getLogs(): Promise<string[]> {
  const response = await api.get<{ logs: string[] }>("/logs");
  return response.data.logs;
}

export async function getSettings(): Promise<UserSettings> {
  const response = await api.get<UserSettings>("/settings");
  return response.data;
}

export async function saveSettings(payload: UserSettings): Promise<UserSettings> {
  const response = await api.put<UserSettings>("/settings", payload);
  return response.data;
}