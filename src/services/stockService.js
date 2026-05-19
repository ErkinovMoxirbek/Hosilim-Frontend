import api from "../api/Axios"; 

const BASE_URL = "/stocks"; 

export const stockService = {
  getMyBalances: async () => {
    try {
      const response = await api.get(`${BASE_URL}/my-balances`);
      return response.data?.data; 
    } catch (error) {
      console.error("Omborni yuklashda xatolik:", error);
      throw error.response?.data?.message || "Ombor ma'lumotlarini yuklab bo'lmadi!";
    }
  },

  getStocksByFridgeId: async (fridgeId) => {
    try {
      const response = await api.get(`${BASE_URL}/by-fridge/${fridgeId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Xolodilnik yuklarini olib bo'lmadi");
    }
  },

  transferStock: async (stockId, transferData) => {
    try {
      const response = await api.post(`${BASE_URL}/${stockId}/transfer`, transferData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Yukni ko'chirishda xatolik yuz berdi");
    }
  },

  // ==========================================
  // XATONI BEKOR QILISH (OTMENA)
  // ==========================================
  revertFridgeTransfer: async (targetStockId) => {
    try {
      const response = await api.post(`${BASE_URL}/${targetStockId}/revert`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Yukni orqaga qaytarishda xatolik yuz berdi."
      );
    }
  }
};