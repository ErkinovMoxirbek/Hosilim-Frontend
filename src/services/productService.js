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
  }
};

export default cropService;