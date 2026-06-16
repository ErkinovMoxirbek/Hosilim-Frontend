import apiClient from "../api/Axios";

const BASE_URL = "/ayla/shops";

const shopService = {
  // Barcha do'konlarni olish
  getAllShops: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      // Agar backend response.data ichida to'g'ridan-to'g'ri array qaytarsa:
      return response.data || [];
    } catch (error) {
      console.error("Do'konlarni yuklashda xatolik:", error);
      return [];
    }
  },

  // Yangi do'kon qo'shish
  createShop: async (shopData) => {
    try {
      const payload = {
        name: shopData.name?.trim(),
        phoneNumber: shopData.phoneNumber?.trim(),
        address: shopData.address?.trim() || null,
        latitude: shopData.latitude,
        longitude: shopData.longitude,
      };

      const response = await apiClient.post(BASE_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Do'konni saqlashda xatolik:", error);
      throw error; // Komponentda catch ichida xatolik matnini chiqarish uchun throw qilamiz
    }
  }
};

export default shopService;