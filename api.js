import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 180000,
});

export async function runAnalysis(keyword, perSource = 15) {
  const { data } = await api.post("/analyze", { keyword, per_source: perSource });
  return data;
}

export async function listAnalyses() {
  const { data } = await api.get("/analyses");
  return data;
}

export async function getAnalysis(id) {
  const { data } = await api.get(`/analysis/${id}`);
  return data;
}

export async function deleteAnalysis(id) {
  const { data } = await api.delete(`/analysis/${id}`);
  return data;
}

export async function compareAnalyses(ids) {
  const { data } = await api.get(`/compare`, { params: { ids: ids.join(",") } });
  return data;
}

export const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NTMwNTUyOXww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NTMwNTUyOXww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1699899657680-421c2c2d5064?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NTMwNTUyOXww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NTMwNTUyOXww&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/37148308/pexels-photo-37148308.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

export const SENTIMENT_COLORS = {
  positive: "#059669",
  neutral: "#D97706",
  negative: "#DC2626",
};

export const PLATFORM_COLORS = {
  reddit: "#FF4500",
  youtube: "#FF0000",
  news: "#1D4ED8",
};

export function formatNumber(n) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
