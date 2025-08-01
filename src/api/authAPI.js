import { post, get } from "./index";

/**
 * 用户登录
 * 功能描述：使用邮箱和密码进行用户登录
 * 入参：FormData a new FormData object with email and password
 * 返回参数：{ status, access_token }
 * url地址：/user/login
 * 请求方式：POST
 */
export const loginAPI = (data) => {
  return post("/user/login", data);
};

/**
 * 用户注册
 * 功能描述：创建新用户
 * 入参：{ username, email, pwd }
 * 返回参数：重定向或错误信息
 * url地址：/user/register
 * 请求方式：POST
 */
export const registerAPI = (data) => {
  return post("/user/register", data);
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

/**
 * 获取当前用户信息
 * 功能描述：获取当前登录用户的详细信息
 * 入参：无 (token通过拦截器发送)
 * 返回参数：{ user_id, email, created_at }
 * url地址：/user/me
 * 请求方式：GET
 */
export const getProfileAPI = () => {
  return get("/user/me");
};
