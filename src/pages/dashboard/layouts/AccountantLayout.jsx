import { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  TrendingUp,
  ShoppingBasket,
  Users,
  Package,
  DollarSign,
  Settings,
  List,
  X,
  PackagePlus,
  ArrowRightLeft,
  RotateCcw,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

import BrokerDashboard from "../../brokerAndAccountant/BrokerDashboard";
import NewSalePage from "../../brokerAndAccountant/NewSalePage";
import CancelledSalePage from "../../brokerAndAccountant/CancelledSalePage";
import AllSalePage from "../../brokerAndAccountant/AllSalePage";
import PricingPage from "../../brokerAndAccountant/PricingPage";
import NewBasketsPage from "../../brokerAndAccountant/TypeBasketsPage";
import AllBasketsPage from "../../brokerAndAccountant/AllBasketsPage";
import ReturnedBasketsPage from "../../brokerAndAccountant/ReturnedBasketsPage";
import BasketDistributionPage from "../../brokerAndAccountant/BasketDistributionPage";
import FarmerPage from "../../brokerAndAccountant/FarmerPage";

const BASE_PATH = "/dashboard/accountant";

const AccountantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;

    if (path === BASE_PATH || path === `${BASE_PATH}/`) {
      setActiveSection("dashboard");
      return;
    }

    if (path.includes("/sales/")) {
      setActiveSection("sales");
      setIsSubmenuOpen(true);

      if (path.endsWith("/new")) setActiveSubSection("new");
      else if (path.endsWith("/cancelled")) setActiveSubSection("cancelled");
      else setActiveSubSection("all");
      return;
    }

    if (path.includes("/baskets/")) {
      setActiveSection("baskets");
      setIsSubmenuOpen(true);

      if (path.endsWith("/new")) setActiveSubSection("new");
      else if (path.endsWith("/distribution")) setActiveSubSection("distribution");
      else if (path.endsWith("/returned")) setActiveSubSection("returned");
      else setActiveSubSection("all");
      return;
    }

    if (path.endsWith("/farmers")) setActiveSection("farmers");
    else if (path.endsWith("/inventory")) setActiveSection("inventory");
    else if (path.endsWith("/pricing")) setActiveSection("pricing");
    else if (path.endsWith("/profile")) setActiveSection("profile");
  }, [location.pathname]);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);

    if (sectionId === "dashboard") {
      navigate(BASE_PATH);
    } else if (sectionId === "sales") {
      setIsSubmenuOpen(true);
      navigate(`${BASE_PATH}/sales/all`);
    } else if (sectionId === "baskets") {
      setIsSubmenuOpen(true);
      navigate(`${BASE_PATH}/baskets/all`);
    } else {
      navigate(`${BASE_PATH}/${sectionId}`);
    }
    
    // Mobil menyudan bosilganda uni yopish
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubSectionClick = (subSectionId) => {
    setActiveSubSection(subSectionId);
    navigate(`${BASE_PATH}/${activeSection}/${subSectionId}`);
    
    // Mobil menyudan bosilganda uni yopish
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const sections = useMemo(
    () => [
      { id: "dashboard", name: "Bosh Sahifa", icon: Home },
      { id: "sales", name: "Sotuvlar", icon: TrendingUp },
      { id: "baskets", name: "Savatlar", icon: ShoppingBasket },
      { id: "farmers", name: "Fermerlar", icon: Users },
      { id: "inventory", name: "Omborxona", icon: Package },
      { id: "pricing", name: "Narx Belgilash", icon: DollarSign },
      { id: "profile", name: "Profil", icon: Settings },
    ],
    []
  );

  const salesSubmenu = useMemo(
    () => [
      { id: "new", name: "Yangi sotuv", icon: PackagePlus },
      { id: "all", name: "Barcha sotuvlar", icon: List },
      { id: "cancelled", name: "Bekor qilingan", icon: X },
    ],
    []
  );

  const basketsSubmenu = useMemo(
    () => [
      { id: "new", name: "Savat turlari", icon: PackagePlus },
      { id: "distribution", name: "Savat tarqatish", icon: ArrowRightLeft },
      { id: "returned", name: "Qaytarilgan savatlar", icon: RotateCcw },
      { id: "all", name: "Savatlar hammasi", icon: List },
    ],
    []
  );

  const ComingSoon = ({ title }) => (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-2">Bu sahifa tez orada ishlab chiqiladi...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col lg:block relative">
      
      {/* Mobil uchun Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hosilim Tizimi
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

      {/* Mobil uchun qoraytirilgan orqa fon */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🟢 Bu yerdan w-full olib tashlandi 🟢 */}
      <div className="flex flex-1 relative">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[260px] shrink-0">
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
            salesSubmenu={salesSubmenu}
            basketsSubmenu={basketsSubmenu}
          />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out ${
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
            salesSubmenu={salesSubmenu}
            basketsSubmenu={basketsSubmenu}
          />
        </div>

        {/* 🟢 Bu yerdan ham w-full olib tashlandi 🟢 */}
        <div className="flex-1 min-h-screen bg-zinc-50 relative">
          <main className="p-4 lg:p-8">
            <Routes>
              <Route index element={<BrokerDashboard />} />

              <Route path="sales" element={<Navigate to="all" replace />} />
              <Route path="sales/new" element={<NewSalePage />} />
              <Route path="sales/all" element={<AllSalePage />} />
              <Route path="sales/cancelled" element={<CancelledSalePage />} />


              <Route path="baskets" element={<Navigate to="all" replace />} />
              <Route path="baskets/new" element={<NewBasketsPage />} />
              <Route path="baskets/distribution" element={<BasketDistributionPage />} />
              <Route path="baskets/returned" element={<ReturnedBasketsPage />} />
              <Route path="baskets/all" element={<AllBasketsPage />} />

              <Route path="farmers" element={<FarmerPage/>} />
              <Route path="inventory" element={<ComingSoon title="Omborxona" />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="profile" element={<ComingSoon title="Profil" />} />

              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountantLayout;