// src/services/priceService.js
import api from "../../api/Axios"; // api.js fayli joylashgan to'g'ri manzilni yozing

const PRICES_URL = "/ayla/prices";
const PRODUCTS_URL = "/ayla/products";

const priceService = {
  /**
   * Narxlar sahifasi uchun: barcha mahsulot + ularning narx variantlari
   * birgalikda (guruhlangan) qaytadi.
   */
  getAllGrouped: async () => {
    const response = await api.get(PRICES_URL);
    return response.data?.data || response.data;
  },

  /** Bitta mahsulotning barcha narx variantlari. */
  getPricesByProduct: async (productId) => {
    const response = await api.get(`${PRODUCTS_URL}/${productId}/prices`);
    return response.data?.data || response.data;
  },

  /** Mahsulotga yangi narx qo'shish. data: { label?, amount } */
  addPrice: async (productId, data) => {
    const payload = { label: data.label || null, amount: data.amount };
    const response = await api.post(`${PRODUCTS_URL}/${productId}/prices`, payload);
    return response.data?.data || response.data;
  },

  /** Mavjud narxni tahrirlash. */
  updatePrice: async (priceId, data) => {
    const payload = { label: data.label || null, amount: data.amount };
    const response = await api.put(`${PRICES_URL}/${priceId}`, payload);
    return response.data?.data || response.data;
  },

  /** Narxni o'chirish. */
  deletePrice: async (priceId) => {
    const response = await api.delete(`${PRICES_URL}/${priceId}`);
    return response.data;
  },
};

export default priceService;

/** Chip ichida ko'rsatish uchun matn: "Optom: 11 000 so'm" yoki "11 000 so'm" */
export function priceChipText(price, formatSom) {
  return price.label ? `${price.label}: ${formatSom(price.amount)}` : formatSom(price.amount);
}