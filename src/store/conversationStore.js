import { create } from "zustand";
import { getConversationsAPI } from "../api/dashboardAPI";
import { createTaskAPI } from "../api/taskAPI";
import { createConversationAPI, getHistoryAPI } from "../api/conversationAPI";

const useConversationStore = create((set, get) => ({
  conversations: [],
  tasks: [], // 用于存储任务列表
  activeConversationId: null,
  activeTaskId: null,
  isLoading: false,
  isLoadingTasks: false, // 用于任务列表加载状态
  error: null,

  setActiveConversationId: (conversationId) => {
    set({ activeConversationId: conversationId, activeTaskId: null }); // 切换对话时清空任务
  },

  setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),

  startNewConversation: () =>
    set({ activeConversationId: null, activeTaskId: null, messages: [] }),

  ensureConversation: async (title = "新对话") => {
    let activeId = get().activeConversationId;
    if (activeId) {
      return activeId;
    }

    // 1. 前端生成临时ID
    const tempId = `temp-${Date.now()}`;

    try {
      // 2. 调用API创建新对话
      const newConversation = await createConversationAPI({
        title: title,
        conversation_id: tempId,
      });

      // 3. 使用后端返回的数据更新store
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        activeConversationId: newConversation.conversation_id,
      }));

      return newConversation.conversation_id;
    } catch (error) {
      console.error("Failed to ensure conversation:", error);
      // 在这里可以设置一个错误状态来通知UI
      return null;
    }
  },

  createTask: async (taskData) => {
    try {
      const newTask = await createTaskAPI(taskData);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskData.conversation_id]: [
            ...(state.tasks[taskData.conversation_id] || []),
            newTask,
          ],
        },
        activeTaskId: newTask.task_id,
      }));
      return newTask;
    } catch (error) {
      console.error(
        "Failed to create task in store:",
        error.response ? error.response.data : error
      );
      set({ error: error.response ? error.response.data : error.message });
      return null; // 明确返回 null 表示失败
    }
  },

  fetchConversations: async (userId) => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const conversations = await getConversationsAPI(userId);
      set({ conversations: conversations || [], isLoading: false });
      // 如果当前没有激活的对话，可以默认选择第一个
      if (
        !get().activeConversationId &&
        conversations &&
        conversations.length > 0
      ) {
        set({ activeConversationId: conversations[0].conversation_id });
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set({ error, isLoading: false });
    }
  },

  // 用于在创建新对话后刷新列表
  addConversation: (newConversation) => {
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
    }));
  },

  fetchTasks: async (userId) => {
    if (!userId) return;
    set({ isLoadingTasks: true, error: null });
    try {
      const response = await getHistoryAPI(userId);
      // 假设后端返回的数据结构是 { history: [...] }
      set({ tasks: response.history || [], isLoadingTasks: false });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ error, isLoadingTasks: false });
    }
  },
}));

export default useConversationStore;
