import api from "../api/Axios"; // O'zingizning to'g'ri manzilingizni qo'ying

const BASE_URL = "/crops"; // Backenddagi controlleringizga moslang

const cropService = {
  // 1. Jonli hisob-kitob qilish (Backend orqali)
  calculatePreview: async (payload) => {
    try {
      const response = await api.post(`${BASE_URL}/calculate-preview`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Hisoblashda xatolik:", error);
      throw error;
    }
  },

  // 2. Hosilni bazaga saqlash va qabul qilish
  receiveCrop: async (payload) => {
    try {
      const response = await api.post(`${BASE_URL}/receive`, payload);
      return response.data;
    } catch (error) {
      console.error("Qabul qilishda xatolik:", error);
      throw error;
    }
  },

  // 3. Barcha qabul qilingan hosillar tarixini yuklash
  getReceiveHistory: async (page = 0, size = 15) => {
    try {
      const response = await api.get(`${BASE_URL}/history`, {
        params: { page, size }
      });
      return response.data?.data || { content: [], totalPages: 0 };
    } catch (error) {
      console.error("Tarixni yuklashda xatolik:", error);
      return { content: [], totalPages: 0 };
    }
  }
};

export default cropService;