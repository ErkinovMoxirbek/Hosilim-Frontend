import apiClient from "../api/Axios";

const BASE_URL = "/ayla/products";

const productService = {
  // 1. Sahifalash va qidiruv bilan olish
  getAllProducts: async (page = 0, size = 10, search = "") => {
    try {
      const response = await apiClient.get(BASE_URL, {
        params: { page, size, search }
      });
      // Spring Data Page obyekti qaytadi (content, totalPages, totalElements)
      return response.data;
    } catch (error) {
      console.error("Mahsulotlarni yuklashda xatolik:", error);
      throw error;
    }
  },

  // 2. Yangi mahsulot qo'shish
  createProduct: async (productData) => {
    try {
      const payload = {
        name: productData.name.trim(),
        description: productData.description?.trim() || "",
        unit: productData.unit,
        imageUrl: productData.imageUrl?.trim() || ""
      };
      const response = await apiClient.post(BASE_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Mahsulotni saqlashda xatolik:", error);
      throw error;
    }
  },

  // 3. Mahsulotni tahrirlash
  updateProduct: async (id, productData) => {
    try {
      const payload = {
        name: productData.name.trim(),
        description: productData.description?.trim() || "",
        unit: productData.unit,
        imageUrl: productData.imageUrl?.trim() || ""
      };
      const response = await apiClient.put(`${BASE_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Mahsulotni tahrirlashda xatolik:", error);
      throw error;
    }
  },

  // 4. Mahsulotni o'chirish (Soft delete)
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Mahsulotni o'chirishda xatolik:", error);
      throw error;
    }
  }
};

export default productService;