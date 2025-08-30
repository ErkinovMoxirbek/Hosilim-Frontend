import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import Header from './Header';
import DashboardSection from '../sections/DashboardSection';
import FarmersSection from '../sections/FarmersSection';
import FruitsSection from '../sections/FruitsSection';
import PricesSection from '../sections/PricesSection';
import ReportsSection from '../sections/ReportsSection';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userRole, setUserRole] = useState('collector'); // Default role
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={userRole}
        setUserRole={setUserRole}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={userRole}
        setUserRole={setUserRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16 md:mt-0">
          <Routes>
            <Route path="/" element={<DashboardSection />} />
            <Route path="farmers" element={<FarmersSection />} />
            <Route path="fruits" element={<FruitsSection />} />
            <Route path="prices" element={<PricesSection />} />
            <Route path="reports" element={<ReportsSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;