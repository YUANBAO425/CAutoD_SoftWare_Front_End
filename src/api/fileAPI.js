import { post } from "./index.js";
import instance from "./index.js"; // 直接导入 axios 实例
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
 * 请求方式：GET
 */
export async function downloadFileAPI(fileName) {
  try {
    // 由于响应拦截器直接返回 response.data，
    // 对于 responseType: "blob" 的请求，这里直接收到的就是 Blob 对象。
    const blobData = await instance.get(`/download_file/${fileName}`, {
      responseType: "blob", // 关键：告诉 axios 期望一个二进制响应
    });

    // 直接返回获取到的 Blob 数据
    return blobData;
  } catch (error) {
    console.error("Download file API failed:", error);
    throw error; // 重新抛出错误以便上层处理
  }
}
