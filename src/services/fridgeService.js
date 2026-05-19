import api from "../api/Axios"; 

const API_URL = '/fridges';

export const fridgeService = {
  
  // 1. O'ziga tegishli xolodilniklar ro'yxatini olish
  getMyFridges: async () => {
    try {
      const response = await api.get(API_URL);
      return response.data.data; 
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Tarmoqda xatolik yuz berdi. Xolodilniklarni yuklab bo'lmadi."
      );
    }
  },

  // 2. Yangi xolodilnik qo'shish
  createFridge: async (fridgeData) => {
    try {
      const payload = {
        ...fridgeData,
        maxCapacity: parseFloat(fridgeData.maxCapacity),
        temperatureCelsius: fridgeData.temperatureCelsius ? parseFloat(fridgeData.temperatureCelsius) : null
      };
      const response = await api.post(API_URL, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Xolodilnik yaratishda xatolik yuz berdi. Ma'lumotlarni tekshiring."
      );
    }
  },

  // 3. Xolodilnikni tahrirlash (YANGI QO'SHILDI)
  updateFridge: async (fridgeId, fridgeData) => {
    try {
      const payload = {
        ...fridgeData,
        maxCapacity: parseFloat(fridgeData.maxCapacity),
        temperatureCelsius: fridgeData.temperatureCelsius ? parseFloat(fridgeData.temperatureCelsius) : null
      };
      const response = await api.put(`${API_URL}/${fridgeId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Xolodilnikni tahrirlashda xatolik yuz berdi."
      );
    }
  },

  // 4. Xolodilnikni o'chirish
  deleteFridge: async (fridgeId) => {
    try {
      const response = await api.delete(`${API_URL}/${fridgeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Xolodilnikni o'chirish imkonsiz. Tarmoq xatosi.");
    }
  },

  // ==========================================
  // 5. KIRIM-CHIQIM TARIXINI OLISH
  // ==========================================
  getFridgeHistory: async (params) => {
    try {
      // params ichida startDate, endDate, filterType, search, page, size keladi
      const response = await api.get(`${API_URL}/history`, { params });
      return response.data.data; 
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Tarixni yuklashda xatolik yuz berdi."
      );
    }
  },

  // ==========================================
  // 6. TRANZAKSIYA TURLARINI OLISH (YANGI QO'SHILDI)
  // ==========================================
  getTransactionTypes: async () => {
    try {
      const response = await api.get(`${API_URL}/fridge-transactions`);
      return response.data.data; 
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Kirim-chiqim turlarini yuklashda xatolik yuz berdi."
      );
    }
  }
};