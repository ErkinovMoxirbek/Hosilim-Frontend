import api from "../api/Axios"; // api.js fayli joylashgan to'g'ri manzilni ko'rsating

export const completeUserProfile = async (userData) => {
  try {
    // Axios api.js ichida baseURL ni o'zi qo'shadi, shuning uchun faqat endpoint ni yozamiz
    // Shuningdek, getAuthHeaders() kerak emas, interceptor tokenni o'zi ulaydi
    const response = await api.put("/users/complete-profile", userData);

    // Axios javobni avtomatik JSON ga o'giradi, shuning uchun .json() qilish shart emas
    return response.data?.data || response.data;
    
  } catch (error) {
    // Axios xatoliklarini to'g'ri ushlab olish
    const errorMessage = error.response?.data?.message 
                      || error.response?.data?.error 
                      || "Ma'lumotlarni saqlashda xatolik yuz berdi";
                      
    throw new Error(errorMessage);
  }
};