import api from "../api/Axios";  // api.js fayli joylashgan to'g'ri manzilni ko'rsating (masalan: "../services/api")

// api.js o'zida baseURL ni saqlagani uchun faqat endpointni yozamiz:
const API_URL = "/distribution";

const distributionService = {
  // Barcha tarqatilgan savatlar tarixini olish
  getDistributions: async (page = 0, size = 50) => {
    try {
      // axios.get o'rniga api.get, va getAuthHeaders KERAK EMAS
      const response = await api.get(`${API_URL}?page=${page}&size=${size}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Tarqatish tarixini olishda xatolik:", error);
      throw error;
    }
  },

  // Fermerlarga yangi savat tarqatish
  distributeBasket: async (distributionData) => {
    try {
      const payload = {
        farmerId: parseInt(distributionData.farmerId, 10),
        basketId: parseInt(distributionData.basketId, 10),
        quantity: parseInt(distributionData.quantity, 10),
        distributedDate: distributionData.distributedDate, // YYYY-MM-DD
        notes: distributionData.notes
      };

      // axios.post o'rniga api.post
      const response = await api.post(API_URL, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savat tarqatishda xatolik:", error);
      throw error;
    }
  },

  // (Qo'shimcha) Fermerlar ro'yxatini olish uchun API
  getFarmers: async () => {
    try {
      // API_BASE_URL/farmers o'rniga to'g'ridan to'g'ri /farmers yozamiz
      const response = await api.get(`/farmers`);
      return response.data?.data?.content || response.data?.content || [];
    } catch (error) {
      console.error("Fermerlarni olishda xatolik:", error);
      return []; // Xato bo'lsa bo'sh massiv qaytaramiz (UI buzilmasligi uchun)
    }
  }
};

export default distributionService;