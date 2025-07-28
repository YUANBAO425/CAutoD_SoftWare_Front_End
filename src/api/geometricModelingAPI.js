import useUserStore from "../store/userStore";

/**
 * 几何建模 (SSE)
 * 功能描述：向后端提交用户的设计需求，并以流式方式接收响应
 * 入参：
 *   - requestData (object): 符合后端 GeometryRequest 模型的数据
 *   - onMessage (function): 处理接收到的消息的回调函数
 *   - onError (function): 处理错误的回调函数
 *   - onOpen (function): 连接打开时的回调函数
 *   - onClose (function): 连接关闭时的回调函数
 * url地址：/geometry/
 * 请求方式：POST (with streaming response)
 */
export const streamGeometryModeling = async ({
  requestData,
  onMessage,
  onError,
  onOpen,
  onClose,
}) => {
  const token = useUserStore.getState().token;

  if (!token) {
    onError(new Error("未找到授权令牌"));
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8080/geometry/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (onOpen) onOpen();

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (onClose) onClose();
        break;
      }
      const chunk = decoder.decode(value);
      // 简单的实现，假设每个 chunk 包含一个完整的 SSE 消息
      // 在实际应用中，你可能需要一个更健壮的解析器来处理分块的消息
      if (chunk.startsWith("event: message_end")) {
        const dataStr = chunk.substring(chunk.indexOf("data: ") + 6);
        try {
          const data = JSON.parse(dataStr);
          if (onMessage) onMessage(data);
        } catch (e) {
          if (onError) onError(e);
        }
      }
    }
  } catch (error) {
    if (onError) onError(error);
  }
};
