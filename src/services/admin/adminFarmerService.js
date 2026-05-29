import api from '../../api/Axios';

const BASE_URL = '/farmers';

export const adminFarmerService = {
  // Barcha fermerlarni paginatsiya va qidiruv bilan olish
  getAllFarmers: async (search = '', page = 0, size = 15) => {
    try {
      const response = await api.get(BASE_URL, {
        params: { search, page, size }
      });
      // API dan kelayotgan ma'lumot tuzilishiga qarab moslashtirilgan
      return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Fermerlarni yuklashda xatolik yuz berdi");
    }
  }
};