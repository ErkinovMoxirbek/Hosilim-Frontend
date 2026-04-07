import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

export const completeUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/complete-profile`, {
      method: "PUT", // Yoki backend qanday so'rov kutayotganiga qarab POST
      headers: {
        "Content-Type": "application/json",
        // 🔥 XATO TO'G'RILANDI: qavslar qo'shildi
        Authorization: `Bearer ${getAccessToken()}`, 
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ma'lumotlarni saqlashda xatolik yuz berdi");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};