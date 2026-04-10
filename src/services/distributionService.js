import api from "../api/Axios"; 

const BASE_URL = "/basket-transactions";

const distributionService = {
  
  // Barcha tarqatilgan savatlar tarixini olish (Faqat Shu Punkt bo'yicha)
  getGivenHistory: async (page = 0, size = 50) => {
    try {
      const response = await api.get(`${BASE_URL}/history`, {
        params: { page, size }
      });
      // Backend ApiResponse dan "data.content" ichida ro'yxatni beradi
      return response.data?.data?.content || [];
    } catch (error) {
      console.error("Tarqatish tarixini olishda xatolik:", error);
      return []; // UI qotib qolmasligi uchun xato paytida bo'sh array qaytaramiz
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
      // Backenddan bitta tranzaksiya obyekti qaytadi (response.data.data)
      return response.data?.data || null;
    } catch (error) {
      console.error("Savat tarqatishda xatolik:", error);
      throw error; // Xatolik UI dagi Try/Catch ga borishi kerak
    }
  },

  // Fermerlarni izlash (Debounce API)
  searchFarmers: async (keyword) => {
    try {
      const response = await api.get(`/farmers/search`, { 
        params: { q: keyword } 
      });
      // Backend ApiResponse orqali Topilgan fermerlar Listini beradi
      return response.data?.data || [];
    } catch (error) {
      console.error("Fermerlarni qidirishda xatolik:", error);
      return []; 
    }
  }
};

export default distributionService;