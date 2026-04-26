import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// 🟢 YANGILIK: Kerakli yangi ikonkalar (Download, BarChart3, XCircle, RefreshCcw, History) qo'shildi
import {
  Home,
  ShoppingBasket,
  Users,
  Package,
  DollarSign,
  Settings,
  List,
  X,
  PackagePlus,
  ArrowRightLeft,
  Briefcase,
  Download,
  BarChart3,
  XCircle,
  RefreshCcw,
  History
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

import BrokerDashboard from "../../brokerAndAccountant/BrokerDashboard";
import ReceiveCropPage from "../../brokerAndAccountant/ReceiveCropPage";
import CancelledSalePage from "../../brokerAndAccountant/CancelledSalePage";
import ReceiveHistoryPage from "../../brokerAndAccountant/ReceiveHistoryPage";
import PricingPage from "../../brokerAndAccountant/PriceManagerPage";
import BasketCatalogPage from "../../brokerAndAccountant/BasketCatalogPage";
import TransactionBasketsPage from "../../brokerAndAccountant/TransanctionBasketsPage";
import BasketDistributionPage from "../../brokerAndAccountant/BasketDistributionPage";
import AccountantsPage from "../../brokerAndAccountant/AccountantsPage";
import BasketHistoryPage from "../../brokerAndAccountant/BasketHistoryPage";
import FarmerPage from "../../brokerAndAccountant/FarmerPage";
import AnnouncementsPage from "../../brokerAndAccountant/AnnouncementsPage";
import FarmerBalancesPage from "../../brokerAndAccountant/FarmerBalancesPage";

const BASE_PATH = "/dashboard/broker";

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🟢 Sahifa o'zgarganda Sidebar'dagi faol (Active) joyni topish
  useEffect(() => {
    const path = location.pathname;

    if (path === BASE_PATH || path === `${BASE_PATH}/`) {
      setActiveSection("dashboard");
      return;
    }

    if (path.includes("/receive/")) {
      setActiveSection("receive");
      setIsSubmenuOpen(true);
      if (path.endsWith("/new")) setActiveSubSection("new");
      else if (path.endsWith("/daily-report")) setActiveSubSection("daily-report");
      else if (path.endsWith("/cancelled")) setActiveSubSection("cancelled");
      else setActiveSubSection("all");
      return;
    }

    if (path.includes("/baskets/")) {
      setActiveSection("baskets");
      setIsSubmenuOpen(true);
      if (path.endsWith("/catalog")) setActiveSubSection("catalog");
      else if (path.endsWith("/distribution")) setActiveSubSection("distribution");
      else if (path.endsWith("/balances")) setActiveSubSection("balances");
      else if (path.endsWith("/transaction")) setActiveSubSection("transaction");
      else setActiveSubSection("history");
      return;
    }

    if (path.endsWith("/accountants")) setActiveSection("accountants");
    else if (path.endsWith("/farmers")) setActiveSection("farmers");
    else if (path.endsWith("/inventory")) setActiveSection("inventory");
    else if (path.endsWith("/pricing")) setActiveSection("pricing");
    else if (path.endsWith("/profile")) setActiveSection("profile");
  }, [location.pathname]);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);

    if (sectionId === "dashboard") {
      navigate(BASE_PATH);
    } else if (sectionId === "receive") {
      setIsSubmenuOpen(true);
      navigate(`${BASE_PATH}/receive/all`);
    } else if (sectionId === "baskets") {
      setIsSubmenuOpen(true);
      navigate(`${BASE_PATH}/baskets/distribution`); // Savatlarga bosganda to'g'ridan-to'g'ri Qarzlar oynasini ochish ham yaxshi UX
    } else {
      navigate(`${BASE_PATH}/${sectionId}`);
    }
    
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubSectionClick = (subSectionId) => {
    setActiveSubSection(subSectionId);
    navigate(`${BASE_PATH}/${activeSection}/${subSectionId}`);
    
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // 🟢 ASOSIY MENYU
  const sections = useMemo(
    () => [
      { id: "dashboard", name: "Bosh Sahifa", icon: Home },
      { id: "receive", name: "Hosil Qabuli", icon: Download },
      { id: "baskets", name: "Savatlar Aylanmasi", icon: ShoppingBasket },
      { id: "accountants", name: "Xisobchilar", icon: Users },
      { id: "farmers", name: "Fermerlar", icon: Users },
      { id: "inventory", name: "Omborxona", icon: Package },
      { id: "pricing", name: "Narx Belgilash", icon: DollarSign },
      { id: "profile", name: "Profil", icon: Settings },
    ],
    []
  );

  // 🟢 HOSIL QABULI (SUBMENU)
  const receiveSubmenu = useMemo(
    () => [
      { id: "new", name: "Yangi Qabul", icon: PackagePlus },
      { id: "all", name: "Kirimlar Tarixi", icon: List },
      { id: "daily-report", name: "Kunlik Hisobot", icon: BarChart3 },
      { id: "cancelled", name: "Bekor Qilinganlar", icon: XCircle },
    ],
    []
  );

  // 🟢 SAVATLAR AYLANMASI (SUBMENU)
  const basketsSubmenu = useMemo(
    () => [
      { id: "catalog", name: "Ombor (Savat turlari)", icon: Package },
      { id: "distribution", name: "Savat Tarqatish", icon: ArrowRightLeft },
      { id: "balances", name: "Fermerlar Qarzi", icon: Briefcase },
      { id: "transaction", name: "Savatlar aylanmasi", icon: RefreshCcw },
      { id: "history", name: "Umumiy Tarix", icon: History },
    ],
    []
  );

  // Hali yozilmagan sahifalar uchun vaqtinchalik oyna
  const ComingSoon = ({ title }) => (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200 shadow-sm m-4 lg:m-0">
      <h2 className="text-lg lg:text-xl font-bold text-[#0B1A42]">{title}</h2>
      <p className="text-gray-500 mt-2">Bu sahifa ishlab chiqilmoqda...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col overflow-hidden">
      
      {/* Mobil uchun Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-30">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hosil Tizimi
          </h1>
          <p className="text-sm text-gray-600 capitalize">{String(user?.role || "").replace('_', ' ')}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[260px] shrink-0 h-full shadow-sm z-10 relative">
          <Sidebar
            user={user}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={handleSectionClick}
            onLogout={logout}
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={handleSubSectionClick}
            receiveSubmenu={receiveSubmenu}
            basketsSubmenu={basketsSubmenu}
          />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out shadow-2xl ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            user={user}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={handleSectionClick}
            onLogout={logout}
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={handleSubSectionClick}
            receiveSubmenu={receiveSubmenu}
            basketsSubmenu={basketsSubmenu}
          />
        </div>

        {/* ASOSIY QISM */}
        <div className="flex-1 flex flex-col h-full bg-zinc-50 relative overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-2 sm:p-4 lg:p-6">
            <Routes>
              <Route index element={<BrokerDashboard />} />

              {/* HOSIL QABULI YO'LLARI */}
              <Route path="receive" element={<Navigate to="all" replace />} />
              <Route path="receive/new" element={<ReceiveCropPage />} />
              <Route path="receive/all" element={<ReceiveHistoryPage />} />
              <Route path="receive/daily-report" element={<ComingSoon title="Kunlik Hisobot" />} />
              <Route path="receive/cancelled" element={<CancelledSalePage />} />

              {/* SAVATLAR YO'LLARI */}
              <Route path="baskets" element={<Navigate to="balances" replace />} />
              <Route path="baskets/catalog" element={<BasketCatalogPage />} />
              <Route path="baskets/distribution" element={<BasketDistributionPage />} />
              <Route path="baskets/balances" element={<FarmerBalancesPage />} />
              <Route path="baskets/transaction" element={<TransactionBasketsPage />} />
              <Route path="baskets/history" element={<BasketHistoryPage />} />

              {/* BOSHQA YO'LLAR */}
              <Route path="accountants" element={<AccountantsPage />} />
              <Route path="farmers" element={<FarmerPage />} />
              <Route path="inventory" element={<ComingSoon title="Omborxona Zaxirasi" />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="profile" element={<ComingSoon title="Profil Sozlamalari" />} />

              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>

      </div>
    </div>
  );
};

export default BrokerLayout;