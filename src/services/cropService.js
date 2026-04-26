import api from "../api/Axios"; 

const BASE_URL = "/crops"; 

const cropService = {
  // 1. Jonli hisob-kitob qilish
  calculatePreview: async (payload) => {
    try {
      const response = await api.post(`${BASE_URL}/calculate-preview`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Hisoblashda xatolik:", error);
      throw error;
    }
  },

  // 2. Hosilni qabul qilish
  receiveCrop: async (payload) => {
    try {
      const response = await api.post(`${BASE_URL}/receive`, payload);
      return response.data;
    } catch (error) {
      console.error("Qabul qilishda xatolik:", error);
      throw error;
    }
  },

  // 3. Guruhlangan tarixni yuklash (Master)
  getGroupedHistory: async (search = '', page = 0, size = 15) => {
    try {
      const response = await api.get(`${BASE_URL}/history/grouped`, {
        params: { search, page, size }
      });
      return response.data?.data || { content: [], totalPages: 0 };
    } catch (error) {
      console.error("Guruhlangan tarixni yuklashda xatolik:", error);
      return { content: [], totalPages: 0 };
    }
  },

  // 4. Fermerning barcha tranzaksiyalarini yuklash (Detail)
  getFarmerDetails: async (farmerId) => {
    try {
      const response = await api.get(`${BASE_URL}/history/farmer/${farmerId}/details`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Fermer detallarini yuklashda xatolik:", error);
      return [];
    }
  }
};

export default cropService;