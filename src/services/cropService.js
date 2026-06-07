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

  // 5. Meva turlarini yuklash
  getFruitTypes: async () => {
    try {
      const response = await api.get('/fruit-types/active');
      return response.data?.data || [];
    } catch (error) {
      console.error("Meva turlarini yuklashda xato:", error);
      return [];
    }
  },

  // 6. Hisobotlarni guruhlangan holda yuklash
  getReportsGrouped: async (startDate, endDate, search = '', page = 0, size = 50, fruitTypeId = null) => {
    try {
      const params = { page, size };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      if (fruitTypeId) params.fruitTypeId = fruitTypeId; 

      const response = await api.get(`${BASE_URL}/report/grouped`, { params });
      return response.data?.data || { content: [], totalPages: 0 };
    } catch (error) {
      console.error("Hisobotni yuklashda xato:", error);
      throw error;
    }
  },

  // 7. Hisobot detallarini yuklash
  getReportsDetails: async (farmerId, startDate, endDate, fruitTypeId = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (fruitTypeId) params.fruitTypeId = fruitTypeId; 

      const response = await api.get(`${BASE_URL}/report/${farmerId}/details`, { params });
      return response.data?.data || { transactions: [], periodEarned: 0, periodPaid: 0, periodDifference: 0 };
    } catch (error) {
      console.error("Batafsil tarixni yuklashda xato:", error);
      throw error;
    }
  },

  // 8. Excel faylni yuklash
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

  // 9. Chekni yuklash
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
  },

  // =========================================================================
  // YANGI QO'SHILGAN METODLAR
  // =========================================================================

  // 10. Tranzaksiyani bekor qilish
  cancelTransaction: async (id, reason) => {
    try {
      // DELETE so'rovida body bo'lmaydi, shuning uchun parametrlar config ichidagi 'params' da ketadi
      const response = await api.delete(`${BASE_URL}/${id}/cancel`, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      console.error(`Tranzaksiyani bekor qilishda xato [id=${id}]:`, error);
      throw error;
    }
  },

  // 11. Narxni tuzatish
  correctTransactionPrice: async (id, newPriceId, reason) => {
    try {
      // PATCH so'rovida ikkinchi parametr - body payload. Bizda body yo'q (null), ma'lumotlar query param sifatida ketadi.
      const response = await api.patch(`${BASE_URL}/${id}/correct-price`, null, {
        params: { newPriceId, reason }
      });
      return response.data;
    } catch (error) {
      console.error(`Narxni tuzatishda xato [id=${id}]:`, error);
      throw error;
    }
  },

  correctTransactionQuantity: async (id, newBasketCount, reason) => {
    try {
      // Backenddagi @RequestParam nomi bilan bir xil bo'lishi kerak
      const response = await api.patch(`${BASE_URL}/${id}/correct-quantity`, null, {
        params: { 
            newBasketCount: newBasketCount, 
            reason: reason 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Miqdorni tuzatishda xato [id=${id}]:`, error);
      throw error;
    }
  },
  // =========================================================================
  // FILIAL (LENTA) TARIXINI OLISH (Paginatsiya bilan)
  // =========================================================================
  getCollectionPointHistory: async (page = 0, size = 15) => {
    try {
      // API endi faqat /history ga murojaat qiladi (token orqali filial aniqlanadi)
      const response = await api.get(`${BASE_URL}/history`, {
        params: { page, size }
      });
      return response.data?.data || { content: [], totalPages: 0 };
    } catch (error) {
      console.error(`Tarixni yuklashda xato:`, error);
      throw error;
    }
  },

  // services/cropService.js
  getMaxAllowedBaskets: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/max-allowed-baskets`);
    return response.data.data; // Integer qaytadi
  },
};

export default cropService;