import Mock from "mockjs";

const optimizationData = {
  text: "由于以屈服强度为250MPa的结构钢作为材料，此处安全系数设置为2，许用应力约束为250/2 = 125MPa，目标为机械臂的质量，单位为KG，开始优化...",
  simulationImages: [
    "https://placehold.co/600x400/EBF4FF/EBF4FF",
    "https://placehold.co/600x400/EBF4FF/EBF4FF",
  ],
  convergenceCurveUrl: "https://placehold.co/800x300/EBF4FF/EBF4FF",
};

Mock.mock(
  "http://localhost:3000/api/design-optimization/optimize",
  "post",
  () => {
    return {
      code: 200,
      message: "success",
      data: optimizationData,
    };
  }
);
