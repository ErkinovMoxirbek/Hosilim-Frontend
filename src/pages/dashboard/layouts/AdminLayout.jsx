import React, { useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Users, Truck, Apple, DollarSign, BarChart3, Settings, MapPin } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

import AdminDashboard from "../../admin/AdminDashboard";
import CollectionPointsPage from "../../admin/CollectionPointsPage";
import AdminUsersManagement from "../../admin/AdminUsersManagement";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = useMemo(
    () => [
      { id: "dashboard", name: "Bosh Sahifa", icon: Home },
      { id: "users", name: "Foydalanuvchilar", icon: Users },
      { id: "collection-points", name: "Yig'ish punktlari", icon: MapPin },
      { id: "brokers", name: "Brokerlar", icon: Truck },
      { id: "farmers", name: "Fermerlar", icon: Apple },
      { id: "transactions", name: "Moliyaviy Hisobotlar", icon: DollarSign },
      { id: "analytics", name: "Tahlil va Statistika", icon: BarChart3 },
      { id: "settings", name: "Tizim Sozlamalari", icon: Settings },
    ],
    []
  );

  const ComingSoon = ({ title }) => (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-2">Bu sahifa tez orada ishlab chiqiladi...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hosil Tizimi
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
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onLogout={logout}
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        </div>

        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar
            user={user}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onLogout={logout}
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        </div>

        <div className="flex-1 min-w-0">
          <main className="p-3 lg:p-8">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsersManagement />} />
              <Route path="/collection-points" element={<CollectionPointsPage />} />

              <Route path="/brokers" element={<ComingSoon title="Brokerlar" />} />
              <Route path="/farmers" element={<ComingSoon title="Fermerlar" />} />
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
