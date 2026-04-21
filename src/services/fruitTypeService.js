import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/fruit-types`;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
    "Content-Type": "application/json",
  },
});

const fruitTypeService = {
  // 1. Yangi: Backenddan Enum (Navlar) ro'yxatini tortib olish
  getQualities: async () => {
    try {
      const response = await axios.get(`${API_URL}/qualities`, getAuthHeaders());
      return response.data?.data || [];
    } catch (error) {
      console.error("Navlarni yuklashda xatolik:", error);
      throw error;
    }
  },

  // 2. Barcha mevalarni ko'rish
  getAllFruitTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/active`, getAuthHeaders());
      return response.data?.data || [];
    } catch (error) {
      console.error("Meva turlarini yuklashda xatolik:", error);
      throw error;
    }
  },

  // 3. Yangi meva qo'shish
  createFruitType: async (payload) => {
    try {
      const response = await axios.post(API_URL, payload, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Meva qo'shishda xatolik:", error);
      throw error;
    }
  },

  // 4. Holatini o'zgartirish (Faol / Nofaol)
  toggleStatus: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/toggle`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Holatni o'zgartirishda xatolik:", error);
      throw error;
    }
  },
  // Admin barcha mevalarni 
  getAllFruitTypesForAdmin: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data?.data || [];
    } catch (error) {
      console.error("Meva turlarini yuklashda xatolik:", error);
      throw error;
    }
  },
};

export default fruitTypeService;