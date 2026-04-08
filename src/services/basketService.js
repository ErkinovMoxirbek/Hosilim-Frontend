import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/basket`;

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const basketService = {
  /**
   * Punktga tegishli barcha savat turlarini olish
   */
  getBaskets: async (page = 0, size = 50) => {
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&size=${size}`,
        getAuthHeaders()
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savatlarni olishda xatolik:", error);
      throw error;
    }
  },

  /**
   * Backenddan barcha savat materiallari ro'yxatini olish (Enumlar)
   */
  getMaterials: async () => {
    try {
      const response = await axios.get(`${API_URL}/materials`, getAuthHeaders());
      return response.data?.data || response.data; 
    } catch (error) {
      console.error("Materiallarni olishda xatolik:", error);
      throw error;
    }
  },

  /**
   * Yangi savat turini yaratish
   */
  createBasket: async (basketData) => {
    try {
      const payload = {
        name: basketData.name,
        description: basketData.description,
        material: basketData.material,
        dimensions: basketData.dimensions,
        weight: parseFloat(basketData.weight),
        quantity: parseInt(basketData.quantity, 10),
        price: parseFloat(basketData.price)
      };

      const response = await axios.post(API_URL, payload, getAuthHeaders());
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savat yaratishda xatolik:", error);
      throw error;
    }
  },

  // 🚀 YANGI: Tahrirlash (Edit)
  updateBasket: async (id, basketData) => {
    try {
      const payload = {
        name: basketData.name,
        description: basketData.description,
        material: basketData.material,
        dimensions: basketData.dimensions,
        weight: parseFloat(basketData.weight),
        quantity: parseInt(basketData.quantity, 10),
        price: parseFloat(basketData.price)
      };

      const response = await axios.put(`${API_URL}/${id}`, payload, getAuthHeaders());
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savatni yangilashda xatolik:", error);
      throw error;
    }
  },
  addStock: async (id, stockData) => {
    try {
      const payload = {
        quantity: parseInt(stockData.quantity, 10),
        price: parseFloat(stockData.price)
      };
      // Backendda PUT /api/v1/basket/{id}/add-stock API bo'lishi kerak
      const response = await axios.put(`${API_URL}/${id}/add-stock`, payload, getAuthHeaders());
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Kirim qilishda xatolik:", error);
      throw error;
    }
  },

  // 🚀 YANGI: O'chirish (Delete)
  deleteBasket: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Savatni o'chirishda xatolik:", error);
      throw error;
    }
  }
};

export default basketService;