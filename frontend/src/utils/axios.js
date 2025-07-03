import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// 请求前：加上 Authorization header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应错误处理：检测 token 是否过期
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 判断是否是 token 过期的 401 错误
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      error.response.data.code === "token_not_valid"
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        const response = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = response.data.access;
        localStorage.setItem("access", newAccess);
        // 更新请求头重新发送
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return instance(originalRequest); // 重试原始请求
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login"; // 跳转回登录页
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
