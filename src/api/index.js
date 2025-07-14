// API请求封装
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
export const request = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (localStorage.getItem('token')) {
    headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 请求方法封装
export const get = (url, options = {}) => request(url, { ...options, method: 'GET' });
export const post = (url, data, options = {}) => request(url, { ...options, method: 'POST', body: JSON.stringify(data) });
export const put = (url, data, options = {}) => request(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
export const del = (url, options = {}) => request(url, { ...options, method: 'DELETE' });

// API端点导出示例
export const API = {
  auth: {
    login: (data) => post('/auth/login', data),
    register: (data) => post('/auth/register', data),
    logout: () => post('/auth/logout'),
    getProfile: () => get('/auth/profile')
  },
  // 其他API端点
};

export default API; 