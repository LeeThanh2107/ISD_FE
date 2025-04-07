import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Interceptor để tự động gắn token vào request nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu lỗi là 403 Forbidden
    if (error.response && error.response.status === 401) {
      // Xóa token và role khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href="/login";      
    }
    return Promise.reject(error);
  }
);

export default api;