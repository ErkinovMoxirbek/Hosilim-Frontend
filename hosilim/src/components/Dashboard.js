import React, { useState, useMemo } from 'react';
import {
  Routes, Route, Navigate, NavLink, Outlet,
  useLocation, useNavigate
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Apple, TrendingUp, BarChart3, DollarSign, Package,
  Settings, ShoppingCart, Truck, Home, Menu, X, LogOut, ChevronLeft
} from 'lucide-react';

// Dashboard komponentlari
import AdminDashboard from './dashboards/AdminDashboard';
import BrokerDashboard from './dashboards/BrokerDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import ProductsPage from './page/ProductsPage';
import AdminUsersPage from './page/admin/AdminUsersPage';

/* ----------------------- Broker Sales: Layout & Pages (routing uchun) ----------------------- */
const BrokerSalesLayout = () => {
  return (
    <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Sotuvlar</h2>
      </div>
      <Outlet />
    </div>
  );
};

const NewSalePage = () => (
  <div className="space-y-4">
    <p className="text-gray-700">Bu yerda “Yangi sotuv” formasi bo‘ladi.</p>
    <div className="p-3 bg-gray-50 rounded border border-gray-200">
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Fermer tanlash</li>
        <li>Mahsulot(lar) va miqdor</li>
        <li>Narx/Narx belgilash</li>
        <li>To‘lov va yetkazish ma’lumotlari</li>
        <li>Saqlash / Jo‘natish</li>
      </ul>
    </div>
  </div>
);

const AllSaleRow = ({ sale }) => (
  <tr className="border-t">
    <td className="px-3 py-2">{sale.id}</td>
    <td className="px-3 py-2">{sale.date}</td>
    <td className="px-3 py-2">{sale.broker}</td>
    <td className="px-3 py-2">{sale.buyer}</td>
    <td className="px-3 py-2">{sale.total}</td>
    <td className="px-3 py-2">
      <span
        className={`px-2 py-1 rounded text-xs ${
          sale.status === 'Yakunlangan'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : sale.status === 'Jarayonda'
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}
      >
        {sale.status}
      </span>
    </td>
  </tr>
);

const AllSalesPage = () => {
  const data = [
    { id: 'S-1001', date: '2025-09-28', broker: 'Broker 1', buyer: 'Bozor X', total: '23,500,000 so‘m', status: 'Yakunlangan' },
    { id: 'S-1002', date: '2025-09-28', broker: 'Broker 2', buyer: 'Zavod Y', total: '12,000,000 so‘m', status: 'Jarayonda' },
  ];
  return (
    <div className="overflow-auto rounded border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">ID</th>
            <th className="px-3 py-2 text-left font-semibold">Sana</th>
            <th className="px-3 py-2 text-left font-semibold">Broker</th>
            <th className="px-3 py-2 text-left font-semibold">Xaridor</th>
            <th className="px-3 py-2 text-left font-semibold">Jami</th>
            <th className="px-3 py-2 text-left font-semibold">Holat</th>
          </tr>
        </thead>
        <tbody className="text-gray-800 bg-white">
          {data.map(s => <AllSaleRow key={s.id} sale={s} />)}
        </tbody>
      </table>
    </div>
  );
};

const CancelledSalesPage = () => {
  const data = [
    { id: 'S-0991', date: '2025-09-20', reason: 'Xaridor bekor qildi', amount: '7,200,000 so‘m' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-gray-700">Bekor qilingan sotuvlar ro‘yxati:</p>
      <div className="overflow-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">Sana</th>
              <th className="px-3 py-2 text-left font-semibold">Sabab</th>
              <th className="px-3 py-2 text-left font-semibold">Summa</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 bg-white">
            {data.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.reason}</td>
                <td className="px-3 py-2">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ----------------------- Sidebar (2-darajali menyu bilan) ----------------------- */
const Sidebar = ({
  user,
  sections,
  activeSection,
  setActiveSection,
  onLogout,
  isSubmenuOpen,
  setIsSubmenuOpen,
  activeSubSection,
  setActiveSubSection
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Broker sotuvlar submenu elementlari
  const salesSubmenu = useMemo(
    () => ([
      { id: 'new', name: 'Yangi sotuv' },
      { id: 'all', name: 'Barcha sotuvlar' },
      { id: 'cancelled', name: 'Bekor qilingan' },
    ]),
    []
  );

  // URLga qarab active’larni sinxronlash (refresh yoki tashqi navigatsiya holatlari)
  React.useEffect(() => {
    if (user?.role?.includes('BROKER')) {
      if (/\/dashboard\/broker\/sales(\/|$)/.test(location.pathname)) {
        setActiveSection('sales');
        setIsSubmenuOpen(true);
        if (/\/sales\/new$/.test(location.pathname)) setActiveSubSection('new');
        else if (/\/sales\/cancelled$/.test(location.pathname)) setActiveSubSection('cancelled');
        else setActiveSubSection('all');
      }
    }
  }, [location.pathname, setActiveSection, setIsSubmenuOpen, setActiveSubSection, user]);

  const openSalesSubmenu = () => {
    setActiveSection('sales');
    setIsSubmenuOpen(true);
    setActiveSubSection('all');
    navigate('/dashboard/broker/sales'); // index -> all ga redirect bo'ladi
  };

  const handleMainClick = (section) => {
    // Broker va Sotuvlar bo'lsa — submenu ochiladi
    if (user.role.includes('BROKER') && section.id === 'sales') {
      openSalesSubmenu();
      return;
    }

    // Aks holda oddiy navigatsiya
    setActiveSection(section.id);

    if (user.role.includes('FARMER')) {
      navigate(section.id === "dashboard" ? "/dashboard/farmer" : `/dashboard/farmer/${section.id}`);
    }
    if (user.role.includes('ADMIN')) {
      navigate(section.id === "dashboard" ? "/dashboard/admin" : `/dashboard/admin/${section.id}`);
    }
    if (user.role.includes('BROKER')) {
      setIsSubmenuOpen(false);
      navigate(section.id === "dashboard" ? "/dashboard/broker" : `/dashboard/broker/${section.id}`);
    }
  };

  const handleSubClick = (sub) => {
    setActiveSubSection(sub.id);
    navigate(`/dashboard/broker/sales/${sub.id}`);
  };

  const handleBack = () => {
    setIsSubmenuOpen(false);
    // “Sotuvlar”da turgan bo‘lsak, broker dashboardga yoki oldingi bo‘limga qaytamiz:
    navigate('/dashboard/broker');
  };

  return (
    <div className="w-64 lg:w-72 bg-white border-r border-gray-200 h-full">
      {/* Top header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
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

        {/* Submenu rejimida "Orqaga" */}
        {isSubmenuOpen && (
          <button
            onClick={handleBack}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            title="Orqaga"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main list yoki Submenu list */}
      <nav className="p-3 lg:p-4">
        {!isSubmenuOpen ? (
          // Asosiy bo'limlar
          <>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleMainClick(section)}
                className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 mb-1 lg:mb-2 rounded-lg text-sm lg:text-base font-medium transition-colors text-left ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <section.icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="truncate">{section.name}</span>

                {/* “Sotuvlar” bo'lsa, yoniga kichik indikator */}
                {user.role.includes('BROKER') && section.id === 'sales' && (
                  <span className="ml-auto text-xs text-gray-500">▶</span>
                )}
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
          </>
        ) : (
          // Submenu (faqat broker/sales)
          <div>
            <div className="px-3 lg:px-4 py-2.5 lg:py-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
              Sotuvlar bo‘limi
            </div>
            {salesSubmenu.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubClick(sub)}
                className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 mb-1 lg:mb-2 rounded-lg text-sm lg:text-base font-medium transition-colors text-left ${
                  activeSubSection === sub.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {/* Submenu ikonkalarini xohlasangiz alohida qo'shishingiz mumkin; hozircha bullet */}
                <span className="w-2 h-2 rounded-full bg-gray-300 mr-3" />
                <span className="truncate">{sub.name}</span>
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
          </div>
        )}
      </nav>
    </div>
  );
};

/* ----------------------- Main Dashboard ----------------------- */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // 2-darajali menyu holatlari (faqat broker uchun ishlatiladi)
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleBasedRoute = () => {
    if (!user?.role || user.role.length === 0) return '/dashboard/farmer';
    if (user.role.includes('ADMIN')) return '/dashboard/admin';
    if (user.role.includes('BROKER')) return '/dashboard/broker';
    if (user.role.includes('FARMER')) return '/dashboard/farmer';
    return '/dashboard/farmer';
  };

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
        { id: 'farmers', name: 'Fermerlar', icon: Users },
        { id: 'inventory', name: 'Omborxona', icon: Package },
        { id: 'pricing', name: 'Narx Belgilash', icon: DollarSign },
        { id: 'sales', name: 'Sotuvlar', icon: TrendingUp }, // <-- Submenu ochiladi
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

  const renderDashboardContent = () => {
    if (!user?.role) return null;
    if (user.role.includes('ADMIN')) return <AdminDashboard />;
    if (user.role.includes('BROKER')) return <BrokerDashboard />;
    if (user.role.includes('FARMER')) return <FarmerDashboard />;
    return <FarmerDashboard />;
  };

  const renderSectionContent = () => {
    const currentSection = getSections().find(s => s.id === activeSection);
    return (
      <div className="p-4 lg:p-8 bg-white rounded-lg lg:rounded-xl border border-gray-200">
        <div className="flex items-center mb-6">
          {currentSection?.icon && (
            <currentSection.icon className="w-6 h-6 mr-3 text-blue-600" />
          )}
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">
            {currentSection?.name}
          </h2>
        </div>
        <p className="text-gray-600">Bu sahifa tez orada ishlab chiqiladi...</p>
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
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar
            user={user}
            sections={getSections()}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onLogout={logout}
            isSubmenuOpen={isSubmenuOpen}
            setIsSubmenuOpen={setIsSubmenuOpen}
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
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

                    {/* Sotuvlar: nested */}
                    <Route path="/sales/*" element={<BrokerSalesLayout />}>
                      <Route index element={<Navigate to="all" replace />} />
                      <Route path="new" element={<NewSalePage />} />
                      <Route path="all" element={<AllSalesPage />} />
                      <Route path="cancelled" element={<CancelledSalesPage />} />
                    </Route>

                    <Route path="/farmers" element={renderSectionContent()} />
                    <Route path="/inventory" element={renderSectionContent()} />
                    <Route path="/pricing" element={renderSectionContent()} />
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
