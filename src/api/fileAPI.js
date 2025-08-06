import { post } from "./index.js";
import useUserStore from "../store/userStore.js";

/**
 * 上传文件
 * 功能描述：将单个文件上传到服务器
 * 入参：file (File object) - 需要上传的文件
 * 返回参数：包含文件URL或ID的对象
 * url地址：/api/upload_file
 * 请求方式：POST (multipart/form-data)
 */
export function uploadFileAPI(file) {
  const token = useUserStore.getState().token;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("authorization", `Bearer ${token}`);

  return post("/upload_file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 下载文件
 * 功能描述：从服务器下载文件
 * 入参：fileName (string) - 需要下载的文件名
 * 返回参数：文件流
 * url地址：/api/download_file/{file_name}
 * 请求方式：POST
 */
export function downloadFileAPI(fileName) {
  const token = useUserStore.getState().token;
  const formData = new FormData();
  formData.append("authorization", `Bearer ${token}`);

  // 注意：axios 的 post 返回的是 JSON，下载文件通常需要特殊处理
  // 这里假设 axios 实例配置了 responseType: 'blob' 或类似设置
  return post(`/download_file/${fileName}`, formData);
}
