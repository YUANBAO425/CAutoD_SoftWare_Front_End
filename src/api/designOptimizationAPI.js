import { post } from "./index.js";

/**
 * 提交设计优化请求
 * 功能描述：根据用户输入的需求，对指定模型进行设计优化
 * 入参：
 *   - prompt (string): 用户输入的需求文本
 * 返回参数：
 *   - text (string): 解释性文本
 *   - simulationImages (Array): 包含多个仿真结果图片URL的数组
 *   - convergenceCurveUrl (string): 收敛曲线图的URL
 * url地址：/design-optimization/optimize
 * 请求方式：POST
 */
export function optimizeDesign(prompt) {
  return post("/design-optimization/optimize", { prompt });
}
