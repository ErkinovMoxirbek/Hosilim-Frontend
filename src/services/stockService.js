import api from "../api/Axios"; 

const BASE_URL = "/stocks"; 

export const stockService = {
  getMyBalances: async () => {
    try {
      // Token qayerda? Token endi api/Axios.js faylida avtomat qo'shib yuboriladi!
      const response = await api.get(`${BASE_URL}/my-balances`);
      
      return response.data?.data; 
    } catch (error) {
      console.error("Omborni yuklashda xatolik:", error);
      throw error.response?.data?.message || "Ombor ma'lumotlarini yuklab bo'lmadi!";
    }
  },
 

  getStocksByFridgeId: async (fridgeId) => {
    const response = await api.get(`${BASE_URL}/by-fridge/${fridgeId}`);
    return response.data.data;
  },

  transferStock: async (stockId, transferData) => {
    try {
      // transferData ichida faqat: targetFridgeId va basketCount bor
      const response = await api.post(`${BASE_URL}/${stockId}/transfer`, transferData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Yukni ko'chirishda xatolik yuz berdi");
    }
  }
};