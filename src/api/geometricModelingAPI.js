import useUserStore from "../store/userStore";

/**
 * 几何建模 (SSE)
 * 功能描述：向后端提交用户的设计需求，并以流式方式接收响应
 * ... (其他注释保持不变)
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
    let buffer = "";

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onClose) onClose();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");

        // 保留最后一个可能不完整的消息在缓冲区中
        buffer = messages.pop();

        for (const message of messages) {
          if (message.trim() === "") continue;

          const lines = message.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.substring(5).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              // 将解析后的数据连同事件类型一起传递给回调
              if (onMessage) onMessage({ event: eventType, data: data });
            } catch (e) {
              if (onError)
                onError(new Error(`JSON parsing error: ${e.message}`));
            }
          }
        }
      }
    };

    processStream().catch(onError);
  } catch (error) {
    if (onError) onError(error);
  }
};
