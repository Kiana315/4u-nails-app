import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 统一 token key（按你项目：authToken / refreshToken）
const ACCESS_KEY = "authToken";

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token && token.trim()) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrapList = (data: any) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const services = {
  // 顾客/预约页：不需要登录
  getPublic: async () => {
    const res = await publicApi.get("/services/");
    return unwrapList(res.data);
  },

  // 后台：需要 admin token
  getAdmin: async () => {
    const res = await authApi.get("/admin/services/");
    return unwrapList(res.data);
  },
};
