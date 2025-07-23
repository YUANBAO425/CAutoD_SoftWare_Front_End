import { get } from "./index.js";

/**
 * 获取软件界面历史结果
 * 功能描述：获取所有历史会话中可以在软件界面查看的结果
 * 入参：无
 * 返回参数：
 *   - history (Array): 包含多个历史会话对象的数组，每个对象包含其结果
 * url地址：/software-interface/history
 * 请求方式：GET
 */
export function getSoftwareHistory() {
  return get("/software-interface/history");
}
