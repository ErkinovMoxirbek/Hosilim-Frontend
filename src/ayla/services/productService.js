// Axios manzili bitta orqaga qaytishi kerak, chunki fayl ayla/services ichida
import api from "../../api/Axios"; 

const API_URL = "/ayla/products";

export const productService = {
  getAll: async () => {
    const response = await api.get(API_URL);
    return response.data?.data || response.data;
  },
  getById: async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data?.data || response.data;
  },
  create: async (data) => {
    const response = await api.post(API_URL, data);
    return response.data?.data || response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data?.data || response.data;
  },
  setPrice: async (id, amount) => {
    const response = await api.put(`${API_URL}/${id}/price`, { amount });
    return response.data?.data || response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data?.data || response.data;
  },
};

export const PRODUCT_UNITS = [
  { value: "LITR", label: "Litr" },
  { value: "KG", label: "Kilogramm" },
  { value: "DONA", label: "Dona" },
];

export function formatSom(amount) {
  if (amount === null || amount === undefined) return "Narx belgilanmagan";
  const formatted = new Intl.NumberFormat("uz-UZ").format(amount);
  return `${formatted} so'm`;
}

export function unitLabel(unitCode) {
  const found = PRODUCT_UNITS.find((u) => u.value === unitCode);
  return found ? found.label : unitCode;
}

// Xatolik matnini ushlab olish uchun yordamchi funksiya qo'shildi
export function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || "Xatolik yuz berdi";
}