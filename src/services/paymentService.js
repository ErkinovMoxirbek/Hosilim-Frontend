import api from '../api/Axios';

const PAYMENT_API_URL = '/payments';

export const paymentService = {
  getDebts: async (search = '', page = 0, size = 12) => {
    const response = await api.get(`${PAYMENT_API_URL}/debts`, {
      params: { search, page, size }
    });
    return response.data.data; // Bu yerda endi Page obyekti qaytadi
  },

  // To'lov qilish
  makePayment: async (paymentData) => {
    try {
      const response = await api.post(`${PAYMENT_API_URL}/pay`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "To'lovni saqlashda xatolik yuz berdi");
    }
  }
};