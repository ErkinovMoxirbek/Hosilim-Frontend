import api from "../api/Axios"; // O'zingizdagi Axios instance yo'lini ko'rsating

const API_URL = '/admin/collection-points';

export const collectionPointService = {
  // 1. Barcha punktlarni olish (Filter va Paginatsiya bilan)
  getAllPoints: async (params) => {
    try {
      // Bo'sh qiymatlarni va "ALL" larni tozalaymiz
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== 'ALL')
      );
      const response = await api.get(API_URL, { params: cleanParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Punktlarni yuklashda xatolik yuz berdi.");
    }
  },

  // 2. Katta brokerlarni (Ownerlarni) olish
  getBigBrokers: async () => {
    try {
      const response = await api.get('/admin/users', { 
        params: { userType: 'BIG_BROKER', limit: 1000 } 
      });
      return response.data;
    } catch (error) {
      console.error("Brokerlarni yuklashda xatolik:", error);
      return { items: [] }; // Xato bo'lsa dastur qulamaydi
    }
  },

  // 3. Yangi punkt yaratish
  createPoint: async (pointData) => {
    try {
      const response = await api.post(API_URL, pointData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Punkt yaratishda xatolik yuz berdi.");
    }
  },

  // 4. Punktni tahrirlash
  updatePoint: async (id, pointData) => {
    try {
      const response = await api.patch(`${API_URL}/${id}`, pointData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Ma'lumotni yangilashda xatolik yuz berdi.");
    }
  },

  // 5. Punktni o'chirish
  deletePoint: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Punktni o'chirish imkonsiz.");
    }
  },

  // 6. Punktni faollashtirish
  activatePoint: async (id) => {
    try {
      const response = await api.post(`${API_URL}/${id}/activate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Faollashtirishda xatolik yuz berdi.");
    }
  },

  // 7. Punktni faolsizlantirish
  deactivatePoint: async (id) => {
    try {
      const response = await api.post(`${API_URL}/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Faolsizlantirishda xatolik yuz berdi.");
    }
  }
};