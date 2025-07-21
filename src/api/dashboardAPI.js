import { get } from "./index";

/**
 * 获取历史记录
 * 功能描述：获取用户的项目历史记录
 * 入参：无
 * 返回参数：历史记录列表
 * url地址：/dashboard/history
 * 请求方式：GET
 */
export const getHistoryAPI = () => {
  return get("/dashboard/history");
};
