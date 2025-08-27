import { post } from "./index.js";
import instance from "./index.js"; // 直接导入 axios 实例
import useUserStore from "../store/userStore.js";

/**
 * 上传文件
 * 功能描述：将单个文件上传到服务器，并附带会话和任务ID
 * 入参：
 *   - file (File object): 需要上传的文件
 *   - conversation_id (string): 关联的会话ID
 *   - task_id (number): 关联的任务ID
 * 返回参数：包含文件URL或ID的对象
 * url地址：/api/upload_file
 * 请求方式：POST (multipart/form-data)
 */
export function uploadFileAPI(file, conversation_id, task_id) {
  const token = useUserStore.getState().token;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversation_id", conversation_id);
  formData.append("task_id", task_id);
  formData.append("authorization", `Bearer ${token}`);

  return post("/upload_file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 下载文件
 * 功能描述：从服务器安全地下载文件。接口会验证文件关联的任务是否属于当前用户及会话，仅允许下载有权访问的文件。
 * 入参：
 *   - task_id (integer): 任务 ID，用于标识关联的任务
 *   - conversation_id (string): 会话 ID，用于标识关联的会话
 *   - file_name (string): 要下载的文件的名称或相对路径
 * 返回参数：文件流
 * url地址：/download_file
 * 请求方式：POST
 */
export async function downloadFileAPI(task_id, conversation_id, file_name) {
  try {
    const response = await instance.post(
      "/download_file",
      {
        task_id,
        conversation_id,
        file_name,
      },
      {
        responseType: "blob", // 关键：告诉 axios 期望一个二进制响应
      }
    );

    // 响应拦截器现在会返回整个响应对象，所以我们需要访问 response.data
    return response.data;
  } catch (error) {
    console.error("Download file API failed:", error);
    throw error; // 重新抛出错误以便上层处理
  }
}
