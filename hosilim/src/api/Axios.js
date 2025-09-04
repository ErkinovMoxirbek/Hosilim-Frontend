import axios from "axios";
import API_BASE_URL from "../config"; // sizda bor

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request oldidan token qo‘yish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Javobni tutib olish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Access token expired → refresh qilamiz
      const refreshToken = localStorage.getItem("refreshToken");
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // eski requestni qayta yuborish
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(error.config);
      } catch (err) {
        // Refresh ham eskirgan → login sahifaga qaytarish
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
