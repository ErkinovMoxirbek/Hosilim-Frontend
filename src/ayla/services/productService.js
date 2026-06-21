// src/services/productService.js
import api from "../../api/Axios"; // api.js fayli joylashgan to'g'ri manzilni yozing

const API_URL = "/ayla/products";

const productService = {
  /**
   * Barcha faol mahsulotlar ro'yxatini olish.
   */
  getAllProducts: async () => {
    const response = await api.get(API_URL);
    return response.data?.data || response.data;
  },

  /**
   * Bitta mahsulotni ID bo'yicha olish.
   */
  getProductById: async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data?.data || response.data;
  },

  /**
   * Yangi mahsulot yaratish.
   * data: { name, description, unit, imageUrl }
   */
  createProduct: async (data) => {
    const payload = {
      name: data.name,
      description: data.description,
      unit: data.unit,
      imageUrl: data.imageUrl,
    };
    const response = await api.post(API_URL, payload);
    return response.data?.data || response.data;
  },

  /**
   * Mavjud mahsulotni tahrirlash (nomi, izoh, birlik, rasm).
   */
  updateProduct: async (id, data) => {
    const payload = {
      name: data.name,
      description: data.description,
      unit: data.unit,
      imageUrl: data.imageUrl,
    };
    const response = await api.put(`${API_URL}/${id}`, payload);
    return response.data?.data || response.data;
  },

  /**
   * Mahsulotni o'chirish (soft delete — isActive = false).
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default productService;

/** AylaProductUnit enum qiymatlari — backend bilan bir xil bo'lishi shart */
export const PRODUCT_UNITS = [
  { value: "LITR", label: "Litr" },
  { value: "KG", label: "Kilogramm" },
  { value: "DONA", label: "Dona" },
];

/** Summani "150 000 so'm" ko'rinishida formatlaydi */
export function formatSom(amount) {
  if (amount === null || amount === undefined) return "Narx belgilanmagan";
  const formatted = new Intl.NumberFormat("uz-UZ").format(amount);
  return `${formatted} so'm`;
}

/** Unit kodini o'zbekcha labelga aylantiradi */
export function unitLabel(unitCode) {
  const found = PRODUCT_UNITS.find((u) => u.value === unitCode);
  return found ? found.label : unitCode;
}

/**
 * Axios xatoligidan foydalanuvchiga ko'rsatsa bo'ladigan matnni ajratib oladi.
 * Backend ErrorResponse: { code, message, timestamp }
 */
export function extractErrorMessage(err) {
  return (
    err.response?.data?.message ||
    err.message ||
    "Noma'lum xatolik yuz berdi"
  );
}