import api from '../api/Axios';

// Agar api ichida baseURL: '/api/v1' bo'lsa, bu yerda faqat '/payments' yozish to'g'ri bo'ladi.
const PAYMENT_API_URL = '/payments'; 

export const paymentService = {
  // 1. Qarzdorliklarni olish
  getDebts: async (search = '', page = 0, size = 12) => {
    const response = await api.get(`${PAYMENT_API_URL}/debts`, {
      params: { search, page, size }
    });
    return response.data.data; 
  },

  // 2. To'lov qilish
  makePayment: async (paymentData) => {
    try {
      const response = await api.post(`${PAYMENT_API_URL}/pay`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "To'lovni saqlashda xatolik yuz berdi");
    }
  },

  // =====================================
  // 🟢 YANGLIK: TARIX VA PDF UCHUN
  // =====================================
  
  // 3. To'lovlar tarixini olish
  getHistory: async (search = "", page = 0, size = 12) => {
    const response = await api.get(`${PAYMENT_API_URL}/history`, { 
      params: { search, page, size } 
    });
    return response.data.data; 
  },

  // 4. PDF Kvitansiyani yuklab olish (Blob formatda o'qish juda muhim!)
  downloadReceipt: async (paymentId) => {
    // try/catch ishlatmadim, chunki xato UI da ushlanadi
    const response = await api.get(`${PAYMENT_API_URL}/${paymentId}/receipt/download`, {
      responseType: 'blob' // Backenddan kelayotgan PDF baytlarni buzib qo'ymasligi uchun
    });
    return response.data;
  }
};