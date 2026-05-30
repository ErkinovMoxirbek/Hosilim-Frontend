import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

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
import ReportPage from "../../brokerAndAccountant/ReportPage";
import MyStocksPage from "../../brokerAndAccountant/MyStocksPage";

// Haladelnik va Moliya
import FridgeInventoryPage from "../../brokerAndAccountant/fridge/FridgeInventoryPage"; 
import FridgesPage from "../../brokerAndAccountant/fridge/FridgesPage";
import ColdStoragePage from "../../brokerAndAccountant/fridge/ColdStoragePage";
import PaymentsPage from "../../brokerAndAccountant/payment/PaymentsPage";
import PaymentHistoryPage from "../../brokerAndAccountant/payment/PaymentHistoryPage";

// 🟢 EKSPORTYOR SAHIFALARI
import ExportersManagement from "../../brokerAndAccountant/ExportersManagement";
import ExportHistoryPage from "../../brokerAndAccountant/ExportHistoryPage"; // Oldin yaratgan tariximiz

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const ComingSoon = ({ title }) => (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200 shadow-sm m-4 lg:m-0 h-[80vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-black text-[#0B1A42] mb-2">{title}</h2>
      <p className="text-gray-500 font-medium">Ushbu modul hozirda dasturchilar tomonidan ishlab chiqilmoqda...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col lg:block overflow-hidden relative">
      
      {/* MOBIL UCHUN HEADER */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Hosilim Tizimi
          </h1>
          <p className="text-sm text-gray-600 capitalize">{String(user?.role || "").replace('_', ' ')}</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-1 relative h-full overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[270px] shrink-0 h-full shadow-sm z-10 relative">
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-white transform transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* ASOSIY QISM (O'ng tomon) */}
        <div className="flex-1 flex flex-col h-full bg-zinc-50 relative overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            <Routes>
              <Route index element={<BrokerDashboard />} />

              {/* HOSIL QABULI YO'LLARI */}
              <Route path="finance/report" element={<ReportPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="receive" element={<Navigate to="all" replace />} />
              <Route path="receive/new" element={<ReceiveCropPage />} />
              <Route path="receive/all" element={<ReceiveHistoryPage />} />
              <Route path="receive/warehouse" element={<MyStocksPage />} />
              <Route path="receive/cancelled" element={<CancelledSalePage />} />

              {/* SAVATLAR YO'LLARI */}
              <Route path="baskets" element={<Navigate to="balances" replace />} />
              <Route path="baskets/catalog" element={<BasketCatalogPage />} />
              <Route path="baskets/distribution" element={<BasketDistributionPage />} />
              <Route path="baskets/balances" element={<FarmerBalancesPage />} />
              <Route path="baskets/transaction" element={<TransactionBasketsPage />} />
              <Route path="baskets/history" element={<BasketHistoryPage />} />
              <Route path="baskets/farmers" element={<FarmerPage />} />

              {/* HALADELNIK YO'LLARI */}
              <Route path="inventory" element={<Navigate to="stocks" replace />} />
              <Route path="inventory/stocks" element={<FridgeInventoryPage />} />
              <Route path="inventory/manage" element={<FridgesPage />} />
              <Route path="inventory/history" element={<ColdStoragePage />} />

              {/* FERMER MOLIYASI */}
              <Route path="finance" element={<Navigate to="debts" replace />} />
              <Route path="finance/debts" element={<PaymentsPage />} />
              <Route path="finance/history" element={<PaymentHistoryPage />} />

              {/* 🟢 EKSPORTYORLAR (HAMKORLAR) YO'LLARI */}
              <Route path="exporters" element={<Navigate to="report" replace />} />
              <Route path="exporters/report" element={<ExportersManagement />} />
              <Route path="exporters/history" element={<ExportHistoryPage />} />
              <Route path="exporters/payments" element={<ComingSoon title="Eksportyor To'lovlarni Qabul Qilish" />} />
              <Route path="exporters/payment-history" element={<ComingSoon title="Eksportyor To'lovlar Tarixi" />} />

              {/* BOSHQA YO'LLAR */}
              <Route path="accountants" element={<AccountantsPage />} />
              <Route path="farmers" element={<FarmerPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="profile" element={<ComingSoon title="Profil Sozlamalari" />} />

              {/* Topilmagan sahifalar uchun */}
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>

      </div>
    </div>
  );
};

export default BrokerLayout;