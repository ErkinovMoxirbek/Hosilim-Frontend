import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Home, TrendingUp, ShoppingBasket, Users, Package, DollarSign, Settings, List, X,
  PackagePlus, ArrowRightLeft, RotateCcw
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

import BrokerDashboard from "../../broker/BrokerDashboard";
import NewSalePage from "../../broker/NewSalePage";
import CancelledSalePage from "../../broker/CancelledSalePage";
import AllSalePage from "../../broker/AllSalePage";
import PricingPage from "../../broker/PricingPage";
import NewBasketsPage from "../../broker/TypeBasketsPage";
import AllBasketsPage from "../../broker/AllBasketsPage";
import ReturnedBasketsPage from "../../broker/ReturnedBasketsPage";
import BasketDistributionPage from "../../broker/BasketDistributionPage";
import BrokersPage from "../../broker/BrokersPage";

const BrokerLayout = () => {
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = useMemo(
    () => [
      { id: "dashboard", name: "Bosh Sahifa", icon: Home },
      { id: "sales", name: "Sotuvlar", icon: TrendingUp },
      { id: "baskets", name: "Savatlar", icon: ShoppingBasket },
      { id: "brokers", name: "Xisobchilar", icon: Users },
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
            salesSubmenu={salesSubmenu}
            basketsSubmenu={basketsSubmenu}
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
            salesSubmenu={salesSubmenu}
            basketsSubmenu={basketsSubmenu}
          />
        </div>

        <div className="flex-1 min-w-0">
          <main className="p-3 lg:p-8">
            <Routes>
              <Route path="/" element={<BrokerDashboard />} />

              {/* SALES */}
              <Route path="/sales" element={<Navigate to="/dashboard/big-broker/sales/all" replace />} />
              <Route path="/sales/new" element={<NewSalePage />} />
              <Route path="/sales/all" element={<AllSalePage />} />
              <Route path="/sales/cancelled" element={<CancelledSalePage />} />

              {/* BASKETS */}
              <Route path="/big-broker" element={<Navigate to="/dashboard/big-broker/brokers" replace />} />
              <Route path="/baskets" element={<Navigate to="/dashboard/big-broker/baskets/all" replace />} />
              <Route path="/baskets/new" element={<NewBasketsPage />} />
              <Route path="/baskets/distribution" element={<BasketDistributionPage />} />
              <Route path="/baskets/returned" element={<ReturnedBasketsPage />} />
              <Route path="/baskets/all" element={<AllBasketsPage />} />

              <Route path="/farmers" element={<ComingSoon title="Fermerlar" />} />
              <Route path="/inventory" element={<ComingSoon title="Omborxona" />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/profile" element={<ComingSoon title="Profil" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrokerLayout;
