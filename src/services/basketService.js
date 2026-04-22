import api from "../api/Axios";  // api.js fayli turgan to'g'ri manzilni ko'rsating (masalan: "../services/api")

// api.js ichida baseURL mavjud, shuning uchun faqat endpointni yozamiz:
const API_URL = "/basket";

const basketService = {
  /**
   * Punktga tegishli barcha savat turlarini olish
   */
  getBaskets: async (page = 0, size = 50) => {
    try {
      const response = await api.get(`${API_URL}?page=${page}&size=${size}`);
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
      const response = await api.get(`${API_URL}/materials`);
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

      const response = await api.post(API_URL, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savat yaratishda xatolik:", error);
      throw error;
    }
  },

  /**
   * Savatni tahrirlash (Edit)
   */
  updateBasket: async (id, basketData) => {
    try {
      const payload = {
        name: basketData.name,
        description: basketData.description,
        material: basketData.material,
        dimensions: basketData.dimensions,
        weight: parseFloat(basketData.weight),
        quantity: parseInt(basketData.quantity, 10),
        price: parseFloat(basketData.price),
        isActive: basketData.isActive
      };

      const response = await api.put(`${API_URL}/${id}`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savatni yangilashda xatolik:", error);
      throw error;
    }
  },

  /**
   * Savatni o'chirish (Delete)
   */
  deleteBasket: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Savatni o'chirishda xatolik:", error);
      throw error;
    }
  },

  // ==========================================================
  // 🚀 YANGI AYLANMA VA TARIX (INVENTORY & HISTORY) API'LARI
  // ==========================================================

  /**
   * 1. OMBORGA SOTIB OLINGANDA (KIRIM)
   */
  addStock: async (id, stockData) => {
    try {
      const payload = {
        quantity: parseInt(stockData.quantity, 10),
        price: stockData.price ? parseFloat(stockData.price) : null
      };
      const response = await api.put(`${API_URL}/${id}/add-stock`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Kirim qilishda xatolik:", error);
      throw error;
    }
  },

  /**
   * 2. FERMERGA TARQATILGANDA (CHIQIM)
   */
  giveToFarmer: async (id, distributeData) => {
    try {
      const payload = {
        quantity: parseInt(distributeData.quantity, 10),
        farmerId: parseInt(distributeData.farmerId, 10)
      };
      const response = await api.put(`${API_URL}/${id}/give-to-farmer`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Fermerga tarqatishda xatolik:", error);
      throw error;
    }
  },

  /**
   * 3. FERMERDAN QAYTIB KELGANDA (KIRIM)
   */
  returnFromFarmer: async (id, returnData) => {
    try {
      const payload = {
        quantity: parseInt(returnData.quantity, 10),
        farmerId: parseInt(returnData.farmerId, 10)
      };
      const response = await api.put(`${API_URL}/${id}/return-from-farmer`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Fermerdan qabul qilishda xatolik:", error);
      throw error;
    }
  },

  /**
   * 4. BARCHASI (TARIXNI OLISH)
   */
  getHistory: async (id, page = 0, size = 20) => {
    try {
      const response = await api.get(`${API_URL}/${id}/history?page=${page}&size=${size}`);
      // Endi bu yerda response.data.data ichida pagination obyekti kelyapti. 
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Savat tarixini olishda xatolik:", error);
      throw error;
    }
  },

  getAllHistory: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`${API_URL}/history?page=${page}&size=${size}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Barcha tarixni olishda xatolik:", error);
      throw error;
    }
  },

  
};

export default basketService;