import Mock from "mockjs";

const randomResponses = [
  `
### 无人机机身设计方案
---
#### 一、主体结构
1.  **中心框架**: 采用十字形碳纤维板，保证强度和轻量化。
2.  **机臂**: 可折叠设计，使用高强度复合材料，长度 250mm。
3.  **起落架**: 缓冲式设计，有效吸收着陆冲击。
`,
  `
### 概念跑车外形设计
---
#### 一、车身线条
1.  **流线型设计**: 极低的风阻系数，强调速度感。
2.  **鸥翼门**: 开启方式独特，具有未来感。
3.  **尾翼**: 可根据速度自动调节角度，提供下压力。
`,
  `
### 机械臂建模组件设计方案
---
#### 一、机械臂主体结构组件
1.  **基座 (Base)**: 铝合金 / 铸铁 (保证稳定性)
2.  **大臂 (Upper Arm)**: 空心桁架式设计 (减轻重量同时保证刚度)
3.  **小臂 (Lower Arm)**: 分段式结构 (适应不同工作半径)
`,
];

const fileExtensions = [".step", ".stl", ".iges", ".obj", ".fbx"];

Mock.mock("http://localhost:3000/api/geometric-modeling/design", "post", () => {
  const designResponse = {
    id: Mock.Random.guid(),
    response: Mock.Random.pick(randomResponses),
  };

  // 随机决定是否包含文件
  if (Mock.Random.boolean()) {
    designResponse.fileName =
      Mock.Random.word() + Mock.Random.pick(fileExtensions);
  }

  return {
    code: 200,
    message: "success",
    data: designResponse,
  };
});
