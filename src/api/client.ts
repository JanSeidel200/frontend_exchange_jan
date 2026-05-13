import axios from "axios";

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  CurrencyOption,
} from "../types";

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