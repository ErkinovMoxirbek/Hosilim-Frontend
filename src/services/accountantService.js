import axios from "axios";

// Bu sizning haqiqiy backend yo'lingiz bo'lishi kerak
const API_URL = "http://localhost:8080/api/v1/accountants"; 

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const accountantService = {
  // 1. O'qish (Read)
  getAll: async (page = 0, size = 10, filterBrokerId = null) => {
    let url = `${API_URL}?page=${page}&size=${size}`;
    if (filterBrokerId) {
      url += `&filterBrokerId=${filterBrokerId}`;
    }
    const response = await axios.get(url, getAuthHeaders());
    // Bizning Spring Boot API Response'da: response.data.data.content bo'lib keladi (Page obyekti)
    return response.data?.data || response.data;
  },

  // 2. Yaratish (Create)
  create: async (payload) => {
    // payload = { userId: 123, brokerId: 456 } shaklida bo'ladi
    const response = await axios.post(API_URL, payload, getAuthHeaders());
    return response.data?.data || response.data;
  },

  // 3. Tahrirlash (Update)
  update: async (id, payload) => {
    const response = await axios.put(`${API_URL}/${id}`, payload, getAuthHeaders());
    return response.data?.data || response.data;
  },

  // 4. O'chirish (Delete)
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  }
};