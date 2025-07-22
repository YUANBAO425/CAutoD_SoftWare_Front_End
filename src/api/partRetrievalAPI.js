import { post } from "./index.js";

/**
 * 检索零件
 * 功能描述：根据用户输入的需求，从数据库中检索相似或可替换的零件
 * 入参：
 *   - prompt (string): 用户输入的需求文本
 * 返回参数：
 *   - parts (Array): 包含多个零件对象的数组
 * url地址：/parts/retrieval
 * 请求方式：POST
 */
export function retrieveParts(prompt) {
  return post("/parts/retrieval", { prompt });
}
