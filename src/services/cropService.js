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
  },

  // ← YANGI: Meva turlarini yuklash
  getFruitTypes: async () => {
    try {
      const response = await api.get('/fruit-types/active');
      return response.data?.data || [];
    } catch (error) {
      console.error("Meva turlarini yuklashda xato:", error);
      return [];
    }
  },

  // fruitTypeId parametri qo'shildi
  getReportsGrouped: async (startDate, endDate, search = '', page = 0, size = 50, fruitTypeId = null) => {
    try {
      const params = { page, size };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      if (fruitTypeId) params.fruitTypeId = fruitTypeId;  // ← YANGI

      const response = await api.get(`${BASE_URL}/report/grouped`, { params });
      return response.data?.data || { content: [], totalPages: 0 };
    } catch (error) {
      console.error("Hisobotni yuklashda xato:", error);
      throw error;
    }
  },

  // fruitTypeId parametri qo'shildi
  getReportsDetails: async (farmerId, startDate, endDate, fruitTypeId = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (fruitTypeId) params.fruitTypeId = fruitTypeId;  // ← YANGI

      const response = await api.get(`${BASE_URL}/report/${farmerId}/details`, { params });
      return response.data?.data || { transactions: [], periodEarned: 0, periodPaid: 0, periodDifference: 0 };
    } catch (error) {
      console.error("Batafsil tarixni yuklashda xato:", error);
      throw error;
    }
  },

  downloadExcelReport: async (startDate, endDate, search = '') => {
    try {
      const response = await api.get(`${BASE_URL}/export/excel`, {
        params: { startDate, endDate, search },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Excel faylni yuklashda xatolik:", error);
      throw error;
    }
  },

  downloadReceipt: async (transactionId) => {
    try {
      const response = await api.get(`${BASE_URL}/${transactionId}/receipt/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Chekni yuklashda xato:", error);
      throw error;
    }
  }
};

export default cropService;