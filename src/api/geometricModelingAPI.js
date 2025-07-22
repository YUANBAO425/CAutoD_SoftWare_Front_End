import { post } from "./index.js";

/**
 * 提交设计需求
 * 功能描述：向后端提交用户的设计需求，并获取AI生成的建模方案
 * 入参：
 *   - prompt (string): 用户输入的设计需求文本
 * 返回参数：
 *   - id (string): 对话ID
 *   - response (string): AI生成的建模方案
 * url地址：/geometric-modeling/design
 * 请求方式：POST
 */
export function submitDesignRequest(prompt) {
  return post("/geometric-modeling/design", { prompt });
}
