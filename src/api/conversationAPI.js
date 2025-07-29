import { post } from "./index";
import useUserStore from "../store/userStore";

/**
 * 创建一个新的会话
 * @param {object} conversationData - 包含会话信息的对象
 * @param {string} conversationData.title - 会话的标题
 * @param {string} conversationData.conversation_id - 前端生成的临时或已有的ID
 * @returns {Promise<object>} - 返回创建的会话对象
 */
export const createConversationAPI = (conversationData) => {
  // user_id 和 token 会由 axios 拦截器自动处理
  // 后端 `ConversationCreateRequest` 模型只期望 `title`
  const requestBody = {
    title: conversationData.title,
  };

  // 调用 /geometry/conversation 接口，发送 JSON 数据
  return post("/geometry/conversation", requestBody);
};

/**
 * 获取单个会话的详细信息，包括其下的所有任务
 * @param {string} conversation_id - 会话的ID
 * @returns {Promise<object>} - 返回会话对象，其中应包含任务列表
 */
export const getConversationDetailsAPI = (conversation_id) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  // 后端需要 'authorization' 作为表单字段
  formData.append("authorization", `Bearer ${token}`);

  // 注意: 后端路由已修正为 /conversation/
  return post(`/conversation/${conversation_id}`, formData);
};
