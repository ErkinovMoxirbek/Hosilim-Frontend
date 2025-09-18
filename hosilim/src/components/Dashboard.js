import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Apple, TrendingUp, BarChart3, DollarSign, Package,
  Settings, ShoppingCart, Truck, Home, Menu, X, LogOut
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

// Dashboard komponentlari
import AdminDashboard from './dashboards/AdminDashboard';
import BrokerDashboard from './dashboards/BrokerDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import ProductsPage from './page/ProductsPage';
import AdminUsersPage from './page/admin/AdminUsersPage';

// Sidebar komponenti
const Sidebar = ({ user, sections, activeSection, setActiveSection, onLogout }) => {
  const navigate = useNavigate(); // ✅ navigate hook

  const handleClick = (section) => {
    setActiveSection(section.id);

    console.log(user.role.includes('ADMIN'));

    if (user.role.includes('FARMER')) {
      navigate(section.id === "dashboard" ? "/dashboard/farmer" : `/dashboard/farmer/${section.id}`);
    }
    if (user.role.includes('ADMIN')) {
      navigate(section.id === "dashboard" ? "/dashboard/admin" : `/dashboard/admin/${section.id}`);

    }
    if (user.role.includes('BROKER')) {
      navigate(section.id === "dashboard" ? "/dashboard/broker" : `/dashboard/broker/${section.id}`);
    }
  };

  return (
    <div className="w-64 lg:w-72 bg-white border-r border-gray-200 h-full">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Hosilim Tizimi</h2>
        <div className="flex items-center mt-2">
          <div
            className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full mr-2 ${
              user.role === "ADMIN"
                ? "bg-red-500"
                : user.role === "BROKER"
                ? "bg-blue-500"
                : "bg-green-500"
            }`}
          />
          <p className="text-sm lg:text-base text-gray-600">{user.role}</p>
        </div>
      </div>

      <nav className="p-3 lg:p-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleClick(section)}
            className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 mb-1 lg:mb-2 rounded-lg text-sm lg:text-base font-medium transition-colors text-left ${
              activeSection === section.id
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <section.icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">{section.name}</span>
          </button>
        ))}

        <div className="mt-6 lg:mt-8 pt-3 lg:pt-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            Chiqish
          </button>
        </div>
      </nav>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  console.log(activeSection);

  // Loading holatini tekshirish
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Role asosida route redirect
  // Roldan birini tanlab route qaytarish
  const getRoleBasedRoute = () => {
    if (!user?.role || user.role.length === 0) {
      return '/dashboard/farmer'; // default
    }

    if (user.role.includes('ADMIN')) return '/dashboard/admin';
    if (user.role.includes('BROKER')) return '/dashboard/broker';
    if (user.role.includes('FARMER')) return '/dashboard/farmer'

    return '/dashboard/farmer';
  };


  // Navigatsiya bo‘limlari
  const getSections = () => {
    if (!user?.role) return [];

    if (user.role.includes('ADMIN')) {
      return [
        { id: 'dashboard', name: 'Bosh Sahifa', icon: Home },
        { id: 'users', name: 'Foydalanuvchilar', icon: Users },
        { id: 'brokers', name: 'Brokerlar', icon: Truck },
        { id: 'farmers', name: 'Fermerlar', icon: Apple },
        { id: 'transactions', name: 'Moliyaviy Hisobotlar', icon: DollarSign },
        { id: 'analytics', name: 'Tahlil va Statistika', icon: BarChart3 },
        { id: 'settings', name: 'Tizim Sozlamalari', icon: Settings }
      ];
    }

    if (user.role.includes('BROKER')) {
      return [
        { id: 'dashboard', name: 'Bosh Sahifa', icon: Home },
        { id: 'orders', name: 'Buyurtmalar', icon: ShoppingCart },
        { id: 'farmers', name: 'Fermerlar', icon: Users },
        { id: 'inventory', name: 'Omborxona', icon: Package },
        { id: 'pricing', name: 'Narx Belgilash', icon: DollarSign },
        { id: 'sales', name: 'Sotuvlar', icon: TrendingUp },
        { id: 'profile', name: 'Profil', icon: Settings }
      ];
    }

    if (user.role.includes('FARMER')) {
      return [
        { id: 'dashboard', name: 'Bosh Sahifa', icon: Home },
        { id: 'products', name: 'Mahsulotlarim', icon: Apple },
        { id: 'offers', name: 'Takliflar', icon: ShoppingCart },
        { id: 'brokers', name: 'Brokerlar', icon: Truck },
        { id: 'sales', name: 'Sotish Tarixi', icon: DollarSign },
        { id: 'analytics', name: 'Daromad Tahlili', icon: BarChart3 },
        { id: 'profile', name: 'Profil', icon: Settings }
      ];
    }

    return [];
  };

  // Dashboard content
  const renderDashboardContent = () => {
    if (!user?.role) return null;

    if (user.role.includes('ADMIN')) return <AdminDashboard />;
    if (user.role.includes('BROKER')) return <BrokerDashboard />;
    if (user.role.includes('FARMER')) return <FarmerDashboard />;

    return <FarmerDashboard />; // default
  };


  const renderSectionContent = () => {
    const currentSection = getSections().find(s => s.id === activeSection);

    return (
      <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200">
        {/* Active section indicator */}
        <div className="flex items-center mb-6">
          {currentSection?.icon && (
            <currentSection.icon className="w-6 h-6 mr-3 text-blue-600" />
          )}
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">
            {currentSection?.name}
          </h2>
        </div>

        <p className="text-gray-600">Bu sahifa tez orada ishlab chiqiladi...</p>

        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Hozirgi sahifa: <strong>{activeSection}</strong>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Hosil Tizimi</h1>
          <p className="text-sm text-gray-600">{user.role}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            sections={getSections()}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onLogout={logout}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          <Sidebar
            user={user}
            sections={getSections()}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onLogout={logout}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-3 lg:p-8">
            <Routes>
              {/* Default dashboard route - role ga qarab redirect */}
              <Route path="/" element={<Navigate to={getRoleBasedRoute()} replace />} />

              {/* Admin routes */}
              <Route path="/admin/*" element={
                user.role && user.role.includes('ADMIN') ? (
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<AdminUsersPage />} />
                    <Route path="/brokers" element={renderSectionContent()} />
                    <Route path="/farmers" element={renderSectionContent()} />
                    <Route path="/transactions" element={renderSectionContent()} />
                    <Route path="/analytics" element={renderSectionContent()} />
                    <Route path="/settings" element={renderSectionContent()} />
                  </Routes>
                ) : (
                  <Navigate to={getRoleBasedRoute()} replace />
                )
              } />

              {/* Broker routes */}
              <Route path="/broker/*" element={
                user.role && user.role.includes('BROKER') ? (
                  <Routes>
                    <Route path="/" element={<BrokerDashboard />} />
                    <Route path="/orders" element={renderSectionContent()} />
                    <Route path="/farmers" element={renderSectionContent()} />
                    <Route path="/inventory" element={renderSectionContent()} />
                    <Route path="/pricing" element={renderSectionContent()} />
                    <Route path="/sales" element={renderSectionContent()} />
                    <Route path="/profile" element={renderSectionContent()} />
                  </Routes>
                ) : (
                  <Navigate to={getRoleBasedRoute()} replace />
                )
              } />

              {/* Farmer routes */}
              <Route path="/farmer/*" element={
                user.role && user.role.includes('FARMER') ? (
                  <Routes>
                    <Route path="/" element={<FarmerDashboard />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/offers" element={renderSectionContent()} />
                    <Route path="/brokers" element={renderSectionContent()} />
                    <Route path="/sales" element={renderSectionContent()} />
                    <Route path="/analytics" element={renderSectionContent()} />
                    <Route path="/profile" element={renderSectionContent()} />
                  </Routes>
                ) : (
                  <Navigate to={getRoleBasedRoute()} replace />
                )
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={getRoleBasedRoute()} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;