import axios from "axios";

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    console.error("API请求错误:", error);
    return Promise.reject(error);
  }
);

// 封装请求方法
export const get = (url, params) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const del = (url) => instance.delete(url);

// API端点导出示例
export const API = {
  auth: {
    login: (data) => post("/auth/login", data),
    register: (data) => post("/auth/register", data),
    logout: () => post("/auth/logout"),
    getProfile: () => get("/auth/profile"),
  },
  // 其他API端点
};

export default instance;
