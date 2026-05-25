import api from "../api/Axios";

const API_URL = '/broker/dashboard';

export const brokerDashboardService = {

  getStats: async (filterType, customDate) => {
    try {
      const params = { filter: filterType };
      if (filterType === 'custom') params.date = customDate;
      const response = await api.get(`${API_URL}/stats`, { params });
      return response.data?.data || null;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        "Statistikani yuklashda xatolik yuz berdi."
      );
    }
  },

  getDailyChart: async (chartDays) => {
    try {
      const response = await api.get(`${API_URL}/chart/daily`, {
        params: { days: chartDays },
      });
      return (response.data?.data || []).map(d => ({
        ...d,
        totalWeight: Number(d.totalWeight),
        totalAmount: Number(d.totalAmount),
      }));
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        "Kunlik grafik ma'lumotlarini yuklashda xatolik yuz berdi."
      );
    }
  },

  getFruitDistribution: async (fruitFilter) => {
    try {
      const response = await api.get(`${API_URL}/chart/fruits`, {
        params: { filter: fruitFilter },
      });
      return response.data?.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        "Meva taqsimoti ma'lumotlarini yuklashda xatolik yuz berdi."
      );
    }
  },

  getTopFarmers: async (topFilter) => {
    try {
      const response = await api.get(`${API_URL}/top-farmers`, {
        params: { filter: topFilter },
      });
      return response.data?.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        "Top fermerlar ro'yxatini yuklashda xatolik yuz berdi."
      );
    }
  },
};