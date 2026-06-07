import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth"; // O'zingizning to'g'ri yo'lingizni ko'rsating
import Sidebar from "./components/Sidebar"; // O'zingizning to'g'ri yo'lingizni ko'rsating

import AdminDashboard from "../../admin/AdminDashboard";
import CollectionPointsPage from "../../admin/CollectionPointsPage";
import AdminUsersPage from "../../admin/AdminUsersPage";
import AdminFruitCatalogPage from "../../admin/FruitCatalogPage";
import AdminAnnouncementsPage from "../../admin/AnnouncementsPage";
import AdminFarmersPage from "../../admin/AdminFarmersPage";
import BrokersPage from "../../admin/BrokersPage";
import AdminPointsGridPage from "../../admin/AdminPointsGridPage";
import AdminReceivesTablePage from "../../admin/AdminReceivesTablePage";
import AdminBasketPointsGridPage from "../../admin/AdminBasketPointsGridPage";
import AdminBasketsTablePage from "../../admin/AdminBasketsTablePage";
import AdminFridgePointsGridPage from "../../admin/AdminFridgePointsGridPage";
import AdminFridgeTablePage from "../../admin/AdminFridgeTablePage";
import FarmerDebtsPage from "../../admin/FarmerDebtsPage";
import PaymentHistoryPage from "../../admin/PaymentHistoryPage";

const ComingSoon = ({ title }) => (
  <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200 text-center py-32 shadow-sm">
    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">!</div>
    <h2 className="text-xl lg:text-2xl font-black text-gray-900">{title}</h2>
    <p className="text-gray-500 mt-2 font-medium">Bu sahifa admin nazorati uchun maxsus ishlab chiqilmoqda...</p>
  </div>
);

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Hosilim Tizimi
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{String(user?.role || "").replace('_', ' ')}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0 h-screen sticky top-0 z-10">
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 bg-[#F8FAFC]">
          <main className="p-0">
            <Routes>
              {/* ASOSIY */}
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/fruit-types" element={<AdminFruitCatalogPage />} />
              <Route path="/announcements" element={<AdminAnnouncementsPage />} />

              {/* OBYEKTLAR VA KADRLAR */}
              <Route path="/collection-points" element={<CollectionPointsPage />} />
              <Route path="/brokers" element={<BrokersPage />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/farmers" element={<AdminFarmersPage />} />

              {/* ADMIN MAXSUS (OMBORXONA) UCHUN PROKSI YO'LLAR */}
              {/* 1. Umumiy sexlar ro'yxati (Sidebar dan bosilganda shu ochiladi) */}
              <Route path="/admin-stock/receives" element={<AdminPointsGridPage />} />

              {/* 2. Tanlangan sexning jadvali (Kartochka bosilganda shu ochiladi) */}
              <Route path="/admin-stock/receives/:pointId" element={<AdminReceivesTablePage />} />
              <Route path="/admin-stock/baskets" element={<AdminBasketPointsGridPage />} />
              <Route path="/admin-stock/baskets/:pointId" element={<AdminBasketsTablePage />} />
              <Route path="/admin-stock/fridges" element={<AdminFridgePointsGridPage />} />
              <Route path="/admin-stock/fridges/:pointId" element={<AdminFridgeTablePage />} />

              {/* EKSPORT (HAMKORLAR) */}
              <Route path="/exporters/report" element={<ComingSoon title="Eksportyorlar Boshqaruvi" />} />
              <Route path="/exporters/history" element={<ComingSoon title="Jo'natilgan Yuklar Tarixi" />} />
              <Route path="/exporters/payments" element={<ComingSoon title="Eksportyor To'lovlari" />} />
              <Route path="/exporters/payment-history" element={<ComingSoon title="To'lovlar Tarixi" />} />

              {/* MOLIYA VA KASSA */}
              <Route path="/finance/debts" element={<FarmerDebtsPage />} />
              <Route path="/report" element={<ComingSoon title="Oraliq Moliya Hisobotlari" />} />
              <Route path="/finance/history" element={<PaymentHistoryPage />} />

              <Route path="/analytics" element={<ComingSoon title="Kengaytirilgan Tahlil va Statistika" />} />
              <Route path="/settings" element={<ComingSoon title="Tizim Sozlamalari va Zaxira" />} />

              {/* NOT FOUND ROUTE */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;