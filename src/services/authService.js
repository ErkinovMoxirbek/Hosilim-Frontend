// src/services/authService.js
import axios from "axios";
import API_BASE_URL from "../config";
import { setTokens, getAccessToken, setUser, clearAuth } from "../utils/tokenManager";

// Alohida, toza axios instanceni ishlatamiz (api.js ga aralashmasligi uchun)
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

export const authService = {
  // 1. SMS yuborish
  async sendOtp(phoneE164, signal) {
    try {
      const res = await authAxios.post("/auth/login", { phone: phoneE164 }, { signal });
      return res.data?.data || res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "SMS kod yuborishda xatolik yuz berdi");
    }
  },

  // 2. Kodni tasdiqlash
  async verifyOtp(phoneE164, otp, signal) {
    try {
      const res = await authAxios.post("/auth/verify", { phone: phoneE164, otp }, { signal });
      const data = res.data;

      const accessToken = (data?.data?.accessToken || data?.accessToken || "").trim();
      const refreshToken = (data?.data?.refreshToken || data?.refreshToken || "").trim();

      if (!accessToken) throw new Error("Access token kelmadi (backend response tekshiring)");

      // Tokenlarni localStorage ga saqlaymiz
      setTokens(accessToken, refreshToken);
      return { raw: data, accessToken, refreshToken };

    } catch (error) {
      throw new Error(error.response?.data?.message || "Kodni tasdiqlashda xatolik yuz berdi");
    }
  },

  // 3. 🔥 YANGI QO'SHILDI: api.js qidiradigan refresh funksiyasi
  async refresh(refreshToken) {
    try {
      const res = await authAxios.post("/auth/refresh", { refreshToken });
      // Backend { accessToken, refreshToken } qaytarishi kutilmoqda
      return res.data?.data || res.data; 
    } catch (error) {
      throw error;
    }
  },

  // 4. Profilni olish
  async me(signal) {
    const token = getAccessToken();
    if (!token) throw new Error("Token topilmadi");

    try {
      // Bu yerda tokenni qolda qo'shamiz, chunki api.js dan foydalanmayapmiz
      const res = await authAxios.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      const me = res.data;
      if (me?.data) setUser(me.data);

      return me;
      
    } catch (error) {
      // Agar token eskirgan bo'lsa va refresh ishlamasa, tokenni tozalaymiz
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAuth();
      }
      throw new Error(error.response?.data?.message || "Profilni yuklashda xatolik yuz berdi");
    }
  },
};