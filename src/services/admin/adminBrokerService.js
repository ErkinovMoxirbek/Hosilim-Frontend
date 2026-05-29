import api from '../../api/Axios';

const BASE_URL = '/admin/brokers';

export const adminBrokerService = {
  getBrokersList: async (search = '', page = 0, size = 15) => {
    const response = await api.get(`${BASE_URL}/list`, { params: { search, page, size } });
    return response.data?.data || { content: [], totalElements: 0, totalPages: 0 };
  },

  getFreePoints: async () => {
    const response = await api.get(`${BASE_URL}/free-points`);
    return response.data?.data || [];
  },

  createBroker: async (brokerData) => {
    try {
      const response = await api.post(`${BASE_URL}/create`, brokerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Broker yaratishda xatolik yuz berdi");
    }
  }
};