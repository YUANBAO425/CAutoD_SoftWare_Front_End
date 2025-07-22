import Mock from "mockjs";

const designResponse = {
  id: "chat-123",
  response: `
### 机械臂建模组件设计方案
---
#### 一、机械臂主体结构组件

1.  **基座 (Base)**
    *   **材料**: 铝合金 / 铸铁 (保证稳定性)
    *   **功能**: 固定机械臂至工作台，承载整体重量
    *   **关键参数**: 底座面积≥300x300mm，螺栓孔位适配工业安装
2.  **大臂 (Upper Arm)**
    *   **结构**: 空心桁架式设计 (减轻重量同时保证刚度)
    *   **材料**: 碳纤维复合材料 / 高强度铝合金
    *   **尺寸**: 长度 500-800mm，截面直径 80-120mm
3.  **小臂 (Lower Arm)**
    *   **分段式结构**: 可拆分为前臂和后臂 (适应不同工作半径)
    *   **材料**: 钛合金 (末端需安装传感器时选用)
    *   **尺寸**: 总长度 400-600mm, 末端接口直径 50mm

#### 二、驱动与传动系统组件
...
`,
};

Mock.mock("http://localhost:3000/api/geometric-modeling/design", "post", () => {
  return {
    code: 200,
    message: "success",
    data: designResponse,
  };
});
