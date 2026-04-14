import api from '../api/Axios';

export const announcementService = {
  // Hamma uchun faol e'lonlarni olish
  getActiveAnnouncements: () => {
    return api.get('/announcements/active');
  },
  
  // Admin yangi e'lon yaratishi
  createAnnouncement: (data) => {
    return api.post('/announcements', data);
  },

  // Admin e'lonni o'chirishi (nofaol qilishi)
  deleteAnnouncement: (id) => {
    return api.delete(`/announcements/${id}`);
  }
};