import api from "../api/Axios"; 

const BASE_URL = "/basket-transactions";

const distributionService = {
  
  // Barcha tarqatilgan savatlar tarixini olish
  getAllTransactions: async (page = 0, size = 50) => {
    try {
      const response = await api.get(`${BASE_URL}/history`, {
        params: { page, size }
      });
      return response.data?.data?.content || [];
    } catch (error) {
      console.error("Tarqatish tarixini olishda xatolik:", error);
      return []; 
    }
  },

  getGivenMiniHistory: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`${BASE_URL}/history`, {
        params: { page, size }
      });
      return response.data?.data?.content || [];
    } catch (error) {
      console.error("Tarqatish tarixini olishda xatolik:", error);
      return [];
    }
  },

 // Barcha fermerlarni umumiy qarzi
  getFarmerBalancesSummary: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`${BASE_URL}/balances/summary`, {
        params: { page, size }
      });
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
  }
};

export default distributionService;