import axios from "axios";

// 创建axios实例
const instance = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 60000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    console.error("API请求错误:", error);
    return Promise.reject(error);
  }
);

// 封装请求方法
export const get = (url, params) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const del = (url) => instance.delete(url);

/**
 * 封装 SSE 请求
 * @param {string} url - 请求地址
 * @param {object} options - 包含回调函数的对象
 * @param {object} options.requestData - 发送给后端的数据
 * @param {function} options.onOpen - 连接打开时的回调
 * @param {function} options.onMessage - 收到消息时的回调
 * @param {function} options.onError - 发生错误时的回调
 * @param {function} options.onClose - 连接关闭时的回调
 */
export const sse = (
  url,
  { requestData, onOpen, onMessage, onError, onClose }
) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const start = async () => {
    try {
      const response = await fetch(`${process.env.VITE_API_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onOpen) onOpen();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processText = (text) => {
        buffer += text;
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);

          let eventName = "message";
          let data = "";

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              data = line.substring(5).trim();
            }
          }

          if (eventName && data && onMessage && onMessage[eventName]) {
            try {
              const parsedData = JSON.parse(data);
              onMessage[eventName](parsedData);
            } catch (e) {
              console.error(
                `Failed to parse SSE message data for event ${eventName}:`,
                e
              );
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onClose) onClose();
          break;
        }
        const text = decoder.decode(value, { stream: true });
        processText(text);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        if (onError) onError(error);
      }
    }
  };

  start();

  return {
    close: () => {
      controller.abort();
    },
  };
};

export default instance;
