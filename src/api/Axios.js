import axios from "axios";
import API_BASE_URL from "../config"; // Masalan: http://localhost:8080/api/v1
import { clearAuth, getAccessToken, getRefreshToken, setTokens } from "../utils/tokenManager";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 xato va bu refresh so'rovi emasligiga ishonch hosil qilish
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // MUHIM: 'api' emas, original 'axios' dan foydalanamiz
        // Chunki 'api' yana interceptorga tushib ketishi mumkin
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Backend javobini tekshirish (ApiResponse formatiga moslab)
        const data = res.data.data || res.data;
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken) {
          setTokens(newAccessToken, newRefreshToken);
          
          // Yangi tokenni headerga qo'shish
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Asl so'rovni qaytadan yuborish
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token muddati o'tgan:", refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  clearAuth();
  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
}

export default api;