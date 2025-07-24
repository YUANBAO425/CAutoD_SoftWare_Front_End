import { post } from "./index.js";

/**
 * 上传文件
 * 功能描述：将单个文件上传到服务器
 * 入参：file (File object) - 需要上传的文件
 * 返回参数：包含文件URL或ID的对象
 * url地址：/file/upload
 * 请求方式：POST (multipart/form-data)
 */
export function uploadFileAPI(file) {
  const formData = new FormData();
  formData.append("file", file);

  return post("/file/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
