import Mock from "mockjs";

const historyData = [
  {
    id: "session-1",
    title: "机械臂轻量化优化 (2023-07-22)",
    results: [
      {
        id: "res-1a",
        name: "初步应力云图",
        gifUrl:
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGNqZ3NqZ3B3eG56b2llc2Y5N3V1d2J4Y3p6c216Y3p6cW52b25pZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btQ0NH6r3PEI6L3/giphy.gif",
      },
      {
        id: "res-1b",
        name: "最终优化结果",
        gifUrl:
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXo3Z3JzM3B3N2k5b2ZpY3h6Y3lqY3l0b3R0c3B6Y3l6cW52b25pZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vR8I328u6sedaYE/giphy.gif",
      },
    ],
  },
  {
    id: "session-2",
    title: "无人机机翼空气动力学仿真 (2023-07-21)",
    results: [
      {
        id: "res-2a",
        name: "流线分析动画",
        gifUrl:
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3JzM3B3N2k5b2ZpY3h6Y3lqY3l0b3R0c3B6Y3l6cW52b25pZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0Gquis7AN2B2a25y/giphy.gif",
      },
    ],
  },
  {
    id: "session-3",
    title: "齿轮箱啮合分析 (2023-07-20)",
    results: [
      {
        id: "res-3a",
        name: "齿轮接触应力",
        gifUrl: "https://media.giphy.com/media/3o7TKSha51ATTx9KzC/giphy.gif",
      },
      {
        id: "res-3b",
        name: "振动模态",
        gifUrl: "https://media.giphy.com/media/l0HlW9GDwdAie2tIQ/giphy.gif",
      },
    ],
  },
  {
    id: "session-4",
    title: "汽车悬挂系统动态模拟 (2023-07-19)",
    results: [
      {
        id: "res-4a",
        name: "悬挂行程动画",
        gifUrl: "https://media.giphy.com/media/3o7aD4GrHwn8vsGBTa/giphy.gif",
      },
    ],
  },
];

Mock.mock("http://localhost:3000/api/software-interface/history", "get", () => {
  return {
    code: 200,
    message: "success",
    data: {
      history: historyData,
    },
  };
});
