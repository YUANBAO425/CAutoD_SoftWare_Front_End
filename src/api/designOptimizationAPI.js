import { post } from "./index.js";
import useUserStore from "../store/userStore";

/**
 * 提交设计优化请求
 * 功能描述：根据用户输入的需求，对指定模型进行设计优化
 * 入参：
 *   - requestData (object): 符合后端 OptimizeRequest 模型的数据
 * 返回参数：
 *   - OptimizeResult (object): 包含优化结果的对象
 * url地址：/optimize/
 * 请求方式：POST
 */
export function optimizeDesign(requestData) {
  const token = useUserStore.getState().token;

  // 后端期望 authorization 在 Form 中，但我们通过拦截器在 Header 中发送
  // 这需要后端进行相应的调整
  return post("/optimize/", requestData);
}
