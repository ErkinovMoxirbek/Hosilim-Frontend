import api from "../api/Axios"; 

// API ning asosiy manzili (O'zingizning base URL'ingizga moslang, masalan: 'http://localhost:8080/api/v1/fridges')
const API_URL = '/fridges';

export const fridgeService = {
  
  /**
   * 1. O'ziga tegishli xolodilniklar ro'yxatini olish
   */
  getMyFridges: async () => {
    try {
      // Tokenni headers ichida yuborish axios interceptors orqali sozlangan deb hisoblaymiz.
      // Agar yo'q bo'lsa, bu yerga headers: { Authorization: `Bearer ${token}` } qo'shiladi.
      const response = await api.get(API_URL);
      
      // Backend ApiResponse.builder().data(responseList) formatida qaytargani uchun 
      // to'g'ridan-to'g'ri .data.data ni qaytaramiz
      return response.data.data; 
    } catch (error) {
      // Backenddan kelgan chiroyli xato xabarini ushlab olish yoki standart xato berish
      throw new Error(
        error.response?.data?.message || 
        "Tarmoqda xatolik yuz berdi. Xolodilniklarni yuklab bo'lmadi."
      );
    }
  },

  /**
   * 2. Yangi xolodilnik qo'shish
   */
  createFridge: async (fridgeData) => {
    try {
      // Data ichida string bo'lib qolgan raqamlarni to'g'rilab yuboramiz (xavfsizlik uchun)
      const payload = {
        ...fridgeData,
        maxCapacity: parseFloat(fridgeData.maxCapacity),
        temperatureCelsius: fridgeData.temperatureCelsius ? parseFloat(fridgeData.temperatureCelsius) : null
      };

      const response = await api.post(API_URL, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        "Xolodilnik yaratishda xatolik yuz berdi. Ma'lumotlarni tekshiring."
      );
    }
  },
  deleteFridge: async (fridgeId) => {
    try {
      const response = await api.delete(`${API_URL}/${fridgeId}`);
      return response.data;
    } catch (error) {
      // Backenddan maxsus "Ichida yuk bor" degan xato kelsa ushlab ko'rsatamiz
      throw new Error(error.response?.data?.message || "Xolodilnikni o'chirish imkonsiz. Tarmoq xatosi.");
    }
  }
};