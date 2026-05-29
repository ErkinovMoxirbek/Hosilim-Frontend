import api from '../../api/Axios';

const BASE_URL = '/users';

export const adminUserService = {
  // Barcha foydalanuvchilarni paginatsiya, filter va qidiruv bilan olish
  getUsers: async (params = {}) => {
    try {
      const response = await api.get(BASE_URL, { params });
      return response.data; // Tizimingizdagi ApiResponse obyektini qaytaradi
    } catch (error) {
      throw new Error(error.response?.data?.message || "Foydalanuvchilarni yuklashda xatolik yuz berdi");
    }
  }
};