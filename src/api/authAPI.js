import { post } from "./index";

/**
 * 用户登录
 * 功能描述：使用邮箱和密码进行用户登录
 * 入参：{ email, password }
 * 返回参数：用户信息和token
 * url地址：/auth/login
 * 请求方式：POST
 */
export const loginAPI = (data) => {
  return post("/auth/login", data);
};

/**
 * Google登录
 * 功能描述：使用Google进行用户登录
 * 入参：{ token }
 * 返回参数：用户信息和token
 * url地址：/auth/google
 * 请求方式：POST
 */
export const googleLoginAPI = (data) => {
  return post("/auth/google", data);
};
