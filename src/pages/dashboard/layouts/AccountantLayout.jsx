import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { X, List } from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "./components/Sidebar";

import BrokerDashboard from "../../brokerAndAccountant/BrokerDashboard";
import ReceiveCropPage from "../../brokerAndAccountant/ReceiveCropPage";
import CropTransactionHistory from "../../brokerAndAccountant/CropTransactionHistory";
import ReceiveHistoryPage from "../../brokerAndAccountant/ReceiveHistoryPage";
import PricingPage from "../../brokerAndAccountant/PriceManagerPage";
import BasketCatalogPage from "../../brokerAndAccountant/BasketCatalogPage";
import TransactionBasketsPage from "../../brokerAndAccountant/TransanctionBasketsPage";
import BasketDistributionPage from "../../brokerAndAccountant/BasketDistributionPage";
import FarmerPage from "../../brokerAndAccountant/FarmerPage";
import BasketHistoryPage from "../../brokerAndAccountant/BasketHistoryPage";
import AnnouncementsPage from "../../brokerAndAccountant/AnnouncementsPage";
import FarmerBalancesPage from "../../brokerAndAccountant/FarmerBalancesPage";
import ReportPage from "../../brokerAndAccountant/ReportPage"; 

import FridgeInventoryPage from "../../brokerAndAccountant/fridge/FridgeInventoryPage"; 
import FridgesPage from "../../brokerAndAccountant/fridge/FridgeInventoryPage";
import ColdStoragePage from "../../brokerAndAccountant/fridge/ColdStoragePage";
import PaymentsPage from "../../brokerAndAccountant/payment/PaymentsPage"; 
import PaymentHistoryPage from "../../brokerAndAccountant/payment/PaymentHistoryPage";

const AccountantLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

      <div className="flex flex-1 relative">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[270px] shrink-0">
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[270px] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar user={user} onLogout={logout} />
        </div>

        <div className="flex-1 min-h-screen bg-zinc-50 relative">
          <main className="p-4 lg:p-8">
            <Routes>
              <Route index element={<BrokerDashboard />} />
              <Route path="announcements" element={<AnnouncementsPage />} />

              {/* 🟢 HOSIL QABULI */}
              <Route path="receive" element={<Navigate to="all" replace />} />
              <Route path="receive/new" element={<ReceiveCropPage />} />
              <Route path="receive/all" element={<ReceiveHistoryPage />} />
              {/* XATOLIK TUZATILDI: Omborxona uchun sahifa qo'shildi */}
              <Route path="receive/warehouse" element={<ComingSoon title="Omborxona" />} /> 
              <Route path="receive/cancelled" element={<CropTransactionHistory />} />

              {/* 🟢 SAVATLAR */}
              <Route path="baskets" element={<Navigate to="balances" replace />} />
              <Route path="baskets/catalog" element={<BasketCatalogPage />} />
              <Route path="baskets/distribution" element={<BasketDistributionPage />} />
              <Route path="baskets/balances" element={<FarmerBalancesPage />} />
              <Route path="baskets/transaction" element={<TransactionBasketsPage />} />
              <Route path="baskets/history" element={<BasketHistoryPage />} />

              {/* 🟢 HALADELNIK */}
              <Route path="inventory" element={<Navigate to="stocks" replace />} />
              <Route path="inventory/stocks" element={<FridgeInventoryPage />} />
              <Route path="inventory/manage" element={<FridgesPage />} />
              <Route path="inventory/history" element={<ColdStoragePage />} />

              {/* 🟢 MOLIYA VA KASSA */}
              <Route path="finance" element={<Navigate to="debts" replace />} />
              <Route path="finance/debts" element={<PaymentsPage />} />
              <Route path="finance/report" element={<ReportPage />} /> 
              <Route path="finance/history" element={<PaymentHistoryPage />} />

              {/* BOSHQA */}
              <Route path="farmers" element={<FarmerPage />} />
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