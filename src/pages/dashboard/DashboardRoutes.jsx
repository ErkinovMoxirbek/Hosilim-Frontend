import React, { useMemo, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import AdminLayout from "./layouts/AdminLayout";
import BrokerLayout from "./layouts/BrokerLayout";
import AccountantLayout from "./layouts/AccountantLayout";
import FarmerLayout from "./layouts/FarmerLayout";

import CompleteProfile from "../../pages/CompleteProfile"; 

export default function DashboardRoutes() {
  // useAuth ichidan logout funksiyasini olamiz
  const { user, loading, logout } = useAuth(); 
  const [grace, setGrace] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setGrace(false), 600);
    return () => clearTimeout(t);
  }, []);

  const roles = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user?.roles)) return user.roles;
    if (Array.isArray(user?.role)) return user.role;
    if (typeof user?.role === "string" && user.role.trim()) return [user.role];
    return [];
  }, [user]);

  const userStatus = user?.status?.toUpperCase();

  const hasRole = (key) =>
    roles.some((r) => String(r).toUpperCase().includes(key));

  const defaultRoute = () => {
    if (hasRole("ADMIN")) return "admin";
    if (hasRole("ACCOUNTANT")) return "accountant";
    if (hasRole("BROKER")) return "broker";
    if (hasRole("FARMER")) return "farmer";
    return "/auth"; // Hech qanday roli yo'qlarni auth'ga yoki 403 sahifaga qaytarish xavfsizroq
  };

  // Tizimdan chiqish funksiyasi
  const handleForceLogout = () => {
    if (logout) {
      logout(); // Context ichidagi logout barcha statelarni tozalaydi
    } else {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
  };

  // 1. YUKLANISH HOLATI
  if (loading || (grace && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // 2. TIZIMGA KIRMANGANLAR UCHUN
  if (!user) return <Navigate to="/auth" replace />;

  // =========================================================
  // STATUSLAR BO'YICHA QOROVULLAR (GUARDS)
  // =========================================================

  // 3. O'CHIRILGAN (DELETED) FOYDALANUVCHI
  if (userStatus === "DELETED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-4 border-gray-600">
          <div className="text-5xl mb-4">🗑️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Hisob o'chirilgan</h1>
          <p className="text-gray-600 mb-6">Ushbu akkaunt tizimdan o'chirilgan. Tizimga kirish imkonsiz.</p>
          <button onClick={handleForceLogout} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // 4. BLOKLANGAN (BLOCKED) FOYDALANUVCHI
  if (userStatus === "BLOCKED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-4 border-red-600">
          <div className="text-5xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Hisobingiz bloklangan!</h1>
          <p className="text-gray-600 mb-6">Qoidabuzarlik yoki boshqa sabablarga ko'ra tizimga kirishingiz cheklangan. Ma'muriyat bilan bog'laning.</p>
          <button onClick={handleForceLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
            Tizimdan chiqish
          </button>
        </div>
      </div>
    );
  }

  // 5. INACTIVE (Faol bo'lmagan) FOYDALANUVCHI
  if (userStatus === "INACTIVE") {
    return (
      <Routes>
        {/* Oldidagi sleshlar olib tashlandi */}
        <Route path="complete-profile" element={<CompleteProfile />} />
        <Route path="*" element={<Navigate to="complete-profile" replace />} />
      </Routes>
    );
  }

  // =========================================================
  // 6. ASOSIY TIZIM (Faqat ACTIVE foydalanuvchilar o'tadi)
  // =========================================================
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute()} replace />} />
      <Route path="complete-profile" element={<Navigate to={defaultRoute()} replace />} />

      {/* Path'lar nisbiy yo'lga o'tkazildi */}
      <Route
        path="admin/*"
        element={hasRole("ADMIN") ? <AdminLayout /> : <Navigate to={defaultRoute()} replace />}
      />

      <Route
        path="broker/*"
        element={hasRole("BROKER") ? <BrokerLayout /> : <Navigate to={defaultRoute()} replace />}
      />
      
      <Route
        path="accountant/*"
        element={hasRole("ACCOUNTANT") ? <AccountantLayout /> : <Navigate to={defaultRoute()} replace />}
      />

      <Route
        path="farmer/*"
        element={hasRole("FARMER") ? <FarmerLayout /> : <Navigate to={defaultRoute()} replace />}
      />

      <Route path="*" element={<Navigate to={defaultRoute()} replace />} />
    </Routes>
  );
}