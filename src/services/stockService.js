import api from "../api/Axios"; 

const BASE_URL = "/stocks"; 

export const stockService = {
  // Ombor qoldiqlarini olib kelish
  getMyBalances: async () => {
    try {
      // Token qayerda? Token endi api/Axios.js faylida avtomat qo'shib yuboriladi!
      const response = await api.get(`${BASE_URL}/my-balances`);
      
      return response.data?.data; 
    } catch (error) {
      console.error("Omborni yuklashda xatolik:", error);
      throw error.response?.data?.message || "Ombor ma'lumotlarini yuklab bo'lmadi!";
    }
  }
};