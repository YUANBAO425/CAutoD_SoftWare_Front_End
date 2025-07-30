import { get, post, sse } from "./index";

/**
 * 根据对话ID获取任务列表
 * @param {string} conversationId - 对话的唯一标识符
 * @returns {Promise<Array>} - 包含任务对象的数组
 */
export const getTasksByConversationIdAPI = (conversationId) => {
  return get(`/conversations/${conversationId}/tasks`);
};

/**
 * 创建一个新任务
 * @param {object} taskData - 包含任务信息的对象
 * @param {string} taskData.conversation_id - 任务所属的对话ID
 * @param {string} taskData.task_type - 任务类型 (e.g., 'geometry', 'part_retrieval')
 * @param {object} [taskData.details] - 任务相关的其他细节
 * @returns {Promise<object>} - 返回创建的任务对象，包含新的 task_id
 */
export const createTaskAPI = (taskData) => {
  return post("/tasks", taskData);
};

/**
 * 执行一个任务（流式或一次性）
 * @param {object} executeData - 包含执行任务所需信息的对象
 * @param {string} executeData.task_type - 任务类型
 * @param {boolean} executeData.response_mode - 是否为流式响应
 * @param {function} [executeData.onMessage] - SSE onMessage 回调
 * @param {function} [executeData.onClose] - SSE onClose 回调
 * @param {function} [executeData.onError] - SSE onError 回调
 * @returns {Promise<any>|void} - 对于非流式请求，返回一个包含结果的 Promise
 */
export const executeTaskAPI = (executeData) => {
  const { response_mode, onMessage, onClose, onError, ...requestData } =
    executeData;

  if (response_mode === "streaming") {
    return sse("/tasks/execute", { requestData, onMessage, onClose, onError });
  } else {
    return post("/tasks/execute", requestData);
  }
};

/**
 * 获取所有待处理的任务
 * @returns {Promise<Array>} - 包含待处理任务对象的数组
 */
export const getPendingTasksAPI = () => {
  return get("/tasks/pending");
};
