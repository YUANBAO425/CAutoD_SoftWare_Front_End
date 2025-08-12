import { create } from "zustand";
import { getConversationsAPI } from "../api/dashboardAPI";
import { createTaskAPI } from "../api/taskAPI";
import {
  createConversationAPI,
  getHistoryAPI,
  getTaskHistoryAPI,
} from "../api/conversationAPI";

const useConversationStore = create((set, get) => ({
  conversations: [],
  tasks: [], // 用于存储任务历史列表
  messages: [], // 用于存储当前激活任务的消息
  activeConversationId: null,
  activeTaskId: null,
  isLoading: false,
  isLoadingTasks: false, // 用于任务列表加载状态
  isLoadingMessages: false, // 用于消息加载状态
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        // 为每条消息添加一个唯一的ID，用于React的key
        { ...message, id: `msg-${Date.now()}-${Math.random()}` },
      ],
    })),

  // --- 最终重构：使用函数式 set 保证状态更新的原子性 ---
  updateLastAiMessage: (update) => {
    set((state) => {
      if (
        state.messages.length === 0 ||
        state.messages[state.messages.length - 1].role !== "assistant"
      ) {
        return state;
      }

      const newMessages = state.messages.map((msg, index) => {
        // 只修改最后一条消息
        if (index !== state.messages.length - 1) {
          return msg;
        }

        let updatedMessage = { ...msg };

        // 1. 处理文本块
        if (update.textChunk !== undefined) {
          updatedMessage.content =
            (updatedMessage.content || "") + update.textChunk;
        }

        // 2. 处理图片块
        if (update.image !== undefined) {
          const newImagePart = { type: "image", ...update.image };
          updatedMessage.parts = [
            ...(updatedMessage.parts || []),
            newImagePart,
          ];
        }

        // 3. 处理结束信号
        if (update.finalData !== undefined) {
          updatedMessage.content = update.finalData.answer;
          updatedMessage.metadata = update.finalData.metadata;
        }

        return updatedMessage;
      });

      return { messages: newMessages };
    });
  },

  setActiveConversationId: (conversationId) => {
    set({ activeConversationId: conversationId, activeTaskId: null }); // 切换对话时清空任务
  },

  setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),

  startNewConversation: () =>
    set({
      activeConversationId: null,
      activeTaskId: null,
      messages: [],
    }),

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

  fetchMessagesForTask: async (taskId, conversationId) => {
    if (!taskId) return;
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await getTaskHistoryAPI(taskId);
      const messages = response.message || [];

      set({
        messages: messages, // 直接设置消息，不再处理全局 images
        activeTaskId: taskId,
        activeConversationId: conversationId,
        isLoadingMessages: false,
      });
    } catch (error) {
      console.error(`Failed to fetch messages for task ${taskId}:`, error);
      set({ error, isLoadingMessages: false });
    }
  },

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.task_id !== taskId),
    })),

  updateTask: (taskId, updatedData) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === taskId ? { ...task, ...updatedData } : task
      ),
    })),
}));

export default useConversationStore;
