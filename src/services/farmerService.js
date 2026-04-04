import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/farmers`;

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const farmerService = {
  /**
   * Barcha fermerlarni ro'yxatini olish.
   */
  getAllFarmers: async (searchQuery = '', page = 0, size = 10) => {
    // Qidiruv so'zini URL ga qo'shish uchun xavfsiz formatga o'tkazamiz
    const query = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    
    const response = await axios.get(
      `${API_URL}?page=${page}&size=${size}${query}`, 
      getAuthHeaders()
    );
    
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

    const response = await axios.post(`${API_URL}/quick-add`, payload, getAuthHeaders());
    return response.data?.data || response.data;
  }
};

export default farmerService;