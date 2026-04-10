import axios from "axios";
import API_BASE_URL from "../config";
import { clearAuth, getAccessToken, getRefreshToken, setTokens } from "../utils/tokenManager";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request oldidan token qo‘yish
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Javobni tutib olish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 xatolik va bu so'rov birinchi marta fail bo'lishi (_retry yo'q)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Cheksiz siklga tushmasligi uchun

      const refreshToken = getRefreshToken();

      // 1-QADAM: Refresh token bormi o'zi?
      if (!refreshToken) {
        console.warn("Refresh token topilmadi, loginga yo'naltirilmoqda.");
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        console.log("Refresh token orqali yangi token so'ralmoqda...");
        
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        console.log("Yangi tokenlar muvaffaqiyatli olindi!");
        setTokens(res.data.accessToken, res.data.refreshToken);

        // eski requestni qayta yuborish
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
        
      } catch (err) {
        // 2-QADAM: Asl xatolikni ko'rish
        console.error("Refresh token so'rovida xatolik yuz berdi:", err);
        
        // Agar backend xatoni batafsil qaytargan bo'lsa
        if (err.response) {
            console.error("Backend javobi:", err.response.data);
        }

        // Refresh ham eskirgan yoki xato ishlagan → login sahifaga qaytarish
        clearAuth();
        window.location.href = "/";
        
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;