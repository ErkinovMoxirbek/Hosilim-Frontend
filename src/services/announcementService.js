import api from "../api/Axios"; 

const BASE_URL = "/announcements"; 

export const announcementService = {
  // Hamma uchun faol e'lonlarni olish
  getActiveAnnouncements: () => {
    return api.get(`${BASE_URL}/active`);
  },
  
  // Admin yangi e'lon yaratishi
  createAnnouncement: (data) => {
    return api.post(`${BASE_URL}`, data);
  },

  // Admin e'lonni o'chirishi (nofaol qilishi)
  deleteAnnouncement: (id) => {
    return api.delete(`${BASE_URL}/${id}`);
  }
};