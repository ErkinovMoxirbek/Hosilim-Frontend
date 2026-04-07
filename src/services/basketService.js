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
      // Backend bizga Map qaytarmoqda (content, totalElements...)
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savatlarni olishda xatolik:", error);
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
        material: basketData.material, // PLASTIC, WOOD, SACK
        dimensions: basketData.dimensions,
        weight: parseFloat(basketData.weight) // Backend Double kutadi
      };

      const response = await axios.post(API_URL, payload, getAuthHeaders());
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savat yaratishda xatolik:", error);
      throw error;
    }
  }
};

export default basketService;