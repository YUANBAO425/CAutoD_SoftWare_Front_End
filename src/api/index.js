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
    // 如果请求的 responseType 是 'blob'，并且状态码是 2xx，则直接返回整个响应对象
    // 这样调用方可以访问到 response.data (Blob) 和 response.headers (如 Content-Disposition)
    if (
      (response.config.responseType === "blob" ||
        response.config.responseType === "arraybuffer") &&
      response.status >= 200 &&
      response.status < 300
    ) {
      return response;
    }
    // 否则，返回响应数据
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    console.error("API请求错误:", error);
    // 对于非 Blob 响应的错误，直接拒绝 Promise
    // 对于 Blob 响应的错误，如果需要处理错误信息，可能需要从 error.response.data 中读取
    // 但通常对于下载失败，直接抛出错误即可
    return Promise.reject(error);
  }
);

// 封装请求方法
export const get = (url, config) => instance.get(url, config);
export const post = (url, data, config) => instance.post(url, data, config);
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
              // 智能提取数据：如果解析后的对象中有一个与事件名匹配的键，
              // 则只传递该键的值，否则传递整个对象。
              // 例如 event: part_chunk, data: {"part": {...}} -> onMessage.part_chunk({...})
              const eventPayload =
                parsedData[eventName] !== undefined
                  ? parsedData[eventName]
                  : parsedData;
              onMessage[eventName](eventPayload);
            } catch (e) {
              console.error(
                `Failed to parse SSE message data for event ${eventName}:`,
                e
              );
              // 如果解析失败，尝试将原始数据作为文本传递
              onMessage[eventName](data);
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
