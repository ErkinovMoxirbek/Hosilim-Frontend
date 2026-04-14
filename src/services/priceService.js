import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/prices`;

const priceService = {
  getActivePrices: async () => {
    try {
      const response = await axios.get(`${API_URL}/active`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      return response.data?.data || [];
    } catch (error) {
      throw error;
    }
  },
  setPrice: async (payload) => {
    try {
      const response = await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default priceService;