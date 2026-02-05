// lib/api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ✅ helper：兼容 DRF 分页/非分页
const unwrapList = (data: any) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];


// Attach access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});



// Auto refresh on 401（你这段保持不动即可）
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
        const newAccess = data?.access;
        if (newAccess) {
          localStorage.setItem(ACCESS_KEY, newAccess);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
          return apiClient(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// -------- API endpoints ---------

export const health = {
  ping: () => apiClient.get("/health/"),
};

export const rawClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const auth = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const res = await rawClient.post("/token/", credentials);

      const access = res.data?.access;
      const refresh = res.data?.refresh;

      if (!access) {
        // 没拿到 token 也算失败
        throw new Error("No access token returned");
      }

      localStorage.setItem(ACCESS_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);

      return res;
    } catch (err) {
      // 🔥 确保调用方一定会进入 catch/finally
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};


export const services = {
  // ✅ public: 直接返回数组
  getPublic: async () => {
    const res = await apiClient.get("/services/");
    return unwrapList(res.data);
  },

  // ✅ admin: 直接返回数组
  getAdmin: async () => {
    const res = await apiClient.get("/admin/services/");
    return unwrapList(res.data);
  },

  // 兼容旧调用（可留可删）
  getAll: () => apiClient.get("/services/"),
  getById: (id: string) => apiClient.get(`/services/${id}/`),
};

export const publicApi = {
  getTechnicians: async () => {
    const res = await apiClient.get("/technicians/");
    return unwrapList(res.data);
  },

  // ✅ 新增：创建预约（public，不需要登录）
  createAppointment: (payload: any) => apiClient.post("/public/appointments/", payload),
};


export const admin = {
  // 原来的保留（如果别处在用）
  getAppointments: (params?: any) => apiClient.get("/admin/appointments/", { params }),
  
  // ✅ 新增：直接返回数组（兼容 DRF 分页/非分页）
  listAppointments: async (params?: any) => {
    const res = await apiClient.get("/admin/appointments/", { params });
    return unwrapList(res.data);
  },

  createService: (service: any) => apiClient.post("/admin/services/", service),
  updateService: (id: string, service: any) => apiClient.patch(`/admin/services/${id}/`, service),
  deleteService: (id: string) => apiClient.delete(`/admin/services/${id}/`),

  getTechnicians: async () => {
    const res = await apiClient.get("/admin/technicians/");
    return unwrapList(res.data);
  },
  createTechnician: (technician: any) => apiClient.post("/admin/technicians/", technician),
  updateTechnician: (id: string, technician: any) => apiClient.patch(`/admin/technicians/${id}/`, technician),
  deleteTechnician: (technician: any) => apiClient.delete(`/admin/technicians/${id}/`),

  getAppointmentById: async (id: string) => {
    const res = await apiClient.get(`/admin/appointments/${id}/`);
    return res.data;
  },

  updateAppointment: async (id: string, patch: any) => {
    const res = await apiClient.patch(`/admin/appointments/${id}/`, patch);
    return res.data;
  },
  // ✅ 新增：管理员创建预约
  createAppointment: (payload: any) =>
    apiClient.post("/admin/appointments/", payload).then((r) => r.data),

};


export const slots = {
  getAvailable: async (params: {
    date: string;          // "2026-01-15"
    serviceId: string;     // "9"
    technicianId?: string; // optional
  }) => {
    const res = await apiClient.get("/public/slots/", { params });
    return res.data; // { slots: ["10:00", ...], ... }
  },
};
