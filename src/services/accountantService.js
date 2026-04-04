import axios from "axios";
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

const API_URL = `${API_BASE_URL}/accountants`;

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const accountantService = {
  getAll: async (page = 0, size = 100) => {
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`, getAuthHeaders());
    return response.data?.data || response.data;
  },

  sendOtp: async (phone) => {
    // phone bu yerda "+998901234567" formatida keladi
    return await axios.post(`${API_URL}/send-otp`, { phone }, getAuthHeaders());
  },

  verifyOtp: async (phone, otp) => {
    return await axios.post(`${API_URL}/verify-otp`, { phone, otp }, getAuthHeaders());
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data?.data || response.data;
  },

  update: async (id, data) => {
    // data ichida fullName, address, phone va STATUS ham bor.
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  }
};