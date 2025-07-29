let taskCounter = 3;

export const mockTasks = {
  "conv-123-abc": [
    {
      task_id: "task-001",
      type: "零件检索",
      summary: "检索高强度螺栓",
      created_at: "2023-10-27T10:00:00Z",
      status: "完成",
    },
    {
      task_id: "task-002",
      type: "设计优化",
      summary: "优化支架结构以减轻重量",
      created_at: "2023-10-27T11:30:00Z",
      status: "进行中",
    },
  ],
  "conv-456-def": [
    {
      task_id: "task-003",
      type: "零件检索",
      summary: "寻找兼容的传感器",
      created_at: "2023-10-26T14:00:00Z",
      status: "完成",
    },
  ],
  "conv-789-ghi": [], // 这个对话没有任务
};

// 模拟创建新任务的函数
export const addMockTask = (taskData) => {
  taskCounter += 1;
  const newTask = {
    task_id: `task-${String(taskCounter).padStart(3, "0")}`,
    type: taskData.task_type,
    summary: `新任务: ${taskData.task_type}`,
    created_at: new Date().toISOString(),
    status: "进行中",
    ...taskData.details,
  };

  if (!mockTasks[taskData.conversation_id]) {
    mockTasks[taskData.conversation_id] = [];
  }
  mockTasks[taskData.conversation_id].push(newTask);

  return newTask;
};

// 模拟统一接口的响应
export const getMockResponse = (requestData) => {
  const { task_type } = requestData;

  switch (task_type) {
    case "geometry":
      // 模拟流式响应
      return [
        {
          event: "conversation_info",
          data: {
            conversation_id: requestData.conversation_id,
            task_id: requestData.task_id,
          },
        },
        { event: "text_chunk", data: { text: "正在为您生成" } },
        { event: "text_chunk", data: { text: "一个机械臂..." } },
        {
          event: "message_end",
          data: {
            answer: "已为您生成机械臂模型。",
            metadata: {
              preview_image:
                "https://via.placeholder.com/400x300.png?text=Mechanical+Arm",
            },
          },
        },
      ];
    case "part_retrieval":
      // 模拟一次性响应
      return {
        data: {
          parts: [
            {
              id: "part-01",
              name: "高强度螺栓 M8",
              imageUrl: "https://via.placeholder.com/150?text=Bolt",
            },
            {
              id: "part-02",
              name: "承重支架",
              imageUrl: "https://via.placeholder.com/150?text=Bracket",
            },
          ],
        },
      };
    case "design_optimization":
      // 模拟一次性响应
      return JSON.stringify({
        optimized_file: "optimized_model.stl",
        best_params: [10.5, 20.2, 5.8],
        final_volume: 150.7,
        final_stress: 300.2,
        unit: { volume: "cm^3", stress: "MPa" },
        constraint_satisfied: true,
      });
    default:
      return { error: "Unknown task type" };
  }
};
