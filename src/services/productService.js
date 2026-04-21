import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/products`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getAccessToken()}`, "Content-Type": "application/json" },
});

const productService = {
  // Hosilni tarozidan o'tkazib qabul qilish
  receiveCrop: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}/receive`, payload, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Hosil qabul qilishda xatolik:", error);
      throw error;
    }
  }
};

export default productService;