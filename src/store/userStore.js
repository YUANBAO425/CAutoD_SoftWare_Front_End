import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginAPI } from "../api/authAPI";

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
          const response = await loginAPI(credentials);
          if (response.code === 200) {
            set({
              user: response.data.user,
              token: response.data.token,
              loading: false,
            });
            localStorage.setItem("token", response.data.token);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // 注册
      // register: async (userData) => {
      //   set({ loading: true, error: null });
      //   try {
      //     const response = await API.auth.register(userData);
      //     set({ loading: false });
      //     return response;
      //   } catch (error) {
      //     set({ error: error.message, loading: false });
      //     throw error;
      //   }
      // },

      // 获取用户信息
      // fetchUserProfile: async () => {
      //   if (!get().token) return;

      //   set({ loading: true });
      //   try {
      //     const user = await API.auth.getProfile();
      //     set({ user, loading: false });
      //     return user;
      //   } catch (error) {
      //     set({ error: error.message, loading: false });
      //     throw error;
      //   }
      // },

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
