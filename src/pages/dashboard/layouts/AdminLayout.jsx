import React, { useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

// Sahifalar
import AdminDashboard from "../../admin/AdminDashboard";
import CollectionPointsPage from "../../admin/CollectionPointsPage";
import AdminUsersManagement from "../../admin/AdminUsersManagement";
import AdminFruitCatalogPage from "../../admin/FruitCatalogPage";
import AdminAnnouncementsPage from "../../admin/AnnouncementsPage";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ComingSoon = ({ title }) => (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200 text-center py-20">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-2">Bu sahifa tez orada ishlab chiqiladi...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hosilim Tizimi
          </h1>
          <p className="text-sm text-gray-600">{user?.role}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            onLogout={logout}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar
            user={user}
            onLogout={logout}
          />
        </div>

        <div className="flex-1 min-w-0 lg:ml-[270px]">
          <main className="p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/announcements" element={<AdminAnnouncementsPage />} />
              <Route path="/fruit-types" element={<AdminFruitCatalogPage />} />
              <Route path="/collection-points" element={<CollectionPointsPage />} />
              <Route path="/users" element={<AdminUsersManagement />} />
              
              <Route path="/brokers" element={<ComingSoon title="Brokerlarni Boshqarish" />} />
              <Route path="/farmers" element={<ComingSoon title="Fermerlar Bazasi" />} />
              <Route path="/transactions" element={<ComingSoon title="Moliyaviy Hisobotlar" />} />
              <Route path="/analytics" element={<ComingSoon title="Tahlil va Statistika" />} />
              <Route path="/settings" element={<ComingSoon title="Tizim Sozlamalari" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;