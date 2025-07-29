import { post } from "./index";
import useUserStore from "../store/userStore";

/**
 * 获取指定用户的所有会话
 * 功能描述：根据用户ID获取其全部历史会话记录
 * @param {number} userId - 用户的唯一标识ID
 * @returns {Promise<Array>} - 包含会话对象的数组
 */
export const getConversationsAPI = (userId) => {
  if (!userId) {
    return Promise.reject(new Error("User ID is required"));
  }

  const token = useUserStore.getState().token;
  if (!token) {
    return Promise.reject(new Error("Authorization token not found"));
  }

  // 后端需要 Form 数据，即使为空
  const formData = new FormData();
  formData.append("authorization", token); // 将 token 作为表单字段传递

  // 注意：这里的 post 函数需要能处理 FormData 和正确的 URL
  // URL 已修正，并且 /api 前缀由 axios baseURL 提供
  return post(`/conversation_all/${userId}`, formData);
};
