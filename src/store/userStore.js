import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginAPI, registerAPI, getProfileAPI } from "../api/authAPI";

// 用户状态管理
const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // 登录
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const loginResponse = await loginAPI(credentials);
          if (loginResponse.status !== "success") {
            throw new Error(loginResponse.detail || "登录失败");
          }

          const token = loginResponse.access_token;
          // 关键：在发起下一个请求前，手动更新 axios 实例的头部
          // 这是因为拦截器是在“下一次”请求时才生效的
          const { default: axiosInstance } = await import("../api/index");
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;

          const userProfileResponse = await getProfileAPI();

          // 一次性更新所有状态
          set({
            user: userProfileResponse,
            token: token,
            loading: false,
          });
          localStorage.setItem("token", token);

          return { user: userProfileResponse, token };
        } catch (error) {
          set({
            error: error.message,
            loading: false,
            token: null,
            user: null,
          });
          localStorage.removeItem("token");
          throw error;
        }
      },

      // 注册
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          // 假设 registerAPI 存在于 authAPI.js 中
          const response = await registerAPI(userData);
          set({ loading: false });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // 登出
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      // 清除错误
      clearError: () => set({ error: null }),
    }),
    {
      name: "user-storage", // 持久化存储名称
      partialize: (state) => ({ user: state.user, token: state.token }), // 仅持久化部分状态
    }
  )
);

export default useUserStore;
