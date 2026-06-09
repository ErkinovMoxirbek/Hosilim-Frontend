import api from "../api/Axios";

const BASE_URL = "/basket-transactions";

const basketTransactionService = {

  // Barcha tarqatilgan savatlar tarixini olish
  getAllTransactions: async (page = 0, size = 15) => {
    try {
      const response = await api.get(`${BASE_URL}/history/all`, {
        params: { page, size }
      });
      return response.data?.data || { content: [], totalPages: 1 };
    } catch (error) {
      console.error("Transaksiyalar tarixini olishda xatolik:", error);
      return { content: [], totalPages: 1 };
    }
  },

  getGivenMiniHistory: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`${BASE_URL}/history/mini`, {
        params: { page, size }
      });
      return response.data?.data?.content || [];
    } catch (error) {
      console.error("Tarqatish tarixini olishda xatolik:", error);
      return [];
    }
  },

  // Barcha fermerlarni umumiy qarzi (Qidiruv bilan)
  getFarmerBalancesSummary: async (search = '', page = 0, size = 15) => {
    try {
      const response = await api.get(`${BASE_URL}/balances/summary`, {
        params: { search, page, size }
      });
      // Backenddan kutilgan 'content' ro'yxati qaytadi
      return response.data?.data?.content || [];
    } catch (error) {
      console.error("Balans xulosalarini olishda xatolik:", error);
      return [];
    }
  },

  // Bitta fermerni bosganda, savatlarini olib kelish
  getFarmerBalanceDetails: async (farmerId) => {
    try {
      const response = await api.get(`${BASE_URL}/balances/details/${farmerId}`);
      return response.data?.data || null; // Backenddan shu fermerning detayllari keladi
    } catch (error) {
      console.error("Fermer detallarini olishda xatolik:", error);
      return null;
    }
  },

  // Fermerga savat tarqatish
  distributeBasket: async (distributionData) => {
    try {
      const payload = {
        farmerId: parseInt(distributionData.farmerId, 10),
        basketId: parseInt(distributionData.basketId, 10),
        quantity: parseInt(distributionData.quantity, 10)
      };

      const response = await api.post(`${BASE_URL}/give`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Savat tarqatishda xatolik:", error);
      throw error;
    }
  },

  // Fermerlarni izlash (Debounce API)
  searchFarmers: async (keyword) => {
    try {
      const response = await api.get(`/farmers/search`, {
        params: { q: keyword }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error("Fermerlarni qidirishda xatolik:", error);
      return [];
    }
  },
  // Fermerning qo'lidagi mavjud savatlarini olish
  getFarmerBalances: async (farmerId) => {
    try {
      const response = await api.get(`${BASE_URL}/balances/farmer/${farmerId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Fermer savatlarini olishda xatolik", error);
      return [];
    }
  },

  returnEmptyBaskets: async (data) => {
    /* data obyekti quyidagicha keladi: 
      { farmerId: 12, basketId: 3, quantity: 150 }
    */
    try {
      const response = await api.post(`${BASE_URL}/return-empty`, data);
      return response.data; 
    } catch (error) {
      console.error("Bo'sh savatni qaytarishda xatolik:", error);
      throw error; // Xatoni sahifaga uzatamiz (Alert chiqishi uchun)
    }
  },

  getPendingReturns: async (date) => {
    try {
      const params = {};
      if (date) params.date = date;
      const res = await api.get(`${BASE_URL}/pending-returns`, { params });
      return res.data?.data || [];
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
        "Kutilayotgan qaytarishlarni yuklashda xatolik."
      );
    }
  }
};

export default basketTransactionService;