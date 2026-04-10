import api from "../api/Axios";  // api.js fayli joylashgan to'g'ri manzilni yozing (masalan: "../services/api")

// api.js ichida baseURL (API_BASE_URL) allaqachon sozlangan, 
// shuning uchun bu yerda faqat manzilning davomini yozamiz:
const API_URL = "/farmers";

const farmerService = {
  /**
   * Barcha fermerlarni ro'yxatini olish.
   */
  getAllFarmers: async (searchQuery = '', page = 0, size = 10) => {
    // Qidiruv so'zini URL ga qo'shish uchun xavfsiz formatga o'tkazamiz
    const query = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    
    // 1. axios.get o'rniga api.get ishlatildi
    // 2. getAuthHeaders() olib tashlandi, chunki api.js buni o'zi avtomatik qo'shadi
    const response = await api.get(`${API_URL}?page=${page}&size=${size}${query}`);
    
    return response.data?.data || response.data;
  },

  /**
   * Hisobchi tomonidan tezkor (Soya) fermer qo'shish
   */
  createShadowFarmer: async (farmerData) => {
    const payload = {
      firstName: farmerData.firstName,
      lastName: farmerData.lastName,
      phoneNumber: farmerData.phone,
      isShadow: true,
      status: 'INITIAL' // Boshlang'ich status
    };

    // 1. axios.post o'rniga api.post ishlatildi
    // 2. getAuthHeaders() olib tashlandi
    const response = await api.post(`${API_URL}/quick-add`, payload);
    
    return response.data?.data || response.data;
  }
};

export default farmerService;