import React, { useState, useMemo } from 'react';
import {
  Routes, Route, Navigate, NavLink, Outlet,
  useLocation, useNavigate
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Apple, TrendingUp, BarChart3, DollarSign, Package,
  Settings, ShoppingCart, Truck, Home, Menu, X, LogOut, ChevronLeft,
  ShoppingBasket, PackagePlus, ArrowRightLeft, RotateCcw, List, MapPin
} from 'lucide-react';

// Dashboard komponentlari
import AdminDashboard from './dashboards/AdminDashboard';
import BrokerDashboard from './dashboards/BrokerDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import ProductsPage from './page/ProductsPage';
import AdminUsersPage from './page/admin/AdminUsersPage';
import NewSalePage from './page/broker/NewSalePage';
import CancelledSalePage from './page/broker/CancelledSalePage';
import AllSalePage from './page/broker/AllSalePage';
import PricingPage from './page/broker/PricingPage';
import NewBasketsPage from './page/broker/TypeBasketsPage';
import AllBasketsPage from './page/broker/AllBasketsPage';
import ReturnedBasketsPage from './page/broker/ReturnedBasketsPage';
import BasketDistributionPage from './page/broker/BasketDistributionPage';
import CollectionPointsPage from './page/admin/CollectionPointsPage';
import AdminUsersManagement from '../pages/admin/AdminUsersManagement';

/* ----------------------- Broker Sales: Layout & Pages ----------------------- */
const BrokerSalesLayout = () => {
  return (
      <Outlet />
  );
};

/* ----------------------- Broker Baskets: Layout & Pages ----------------------- */
const BrokerBasketsLayout = () => {
  return (
      <Outlet />
  );
};

/* ----------------------- Sidebar Component ----------------------- */
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

  // Broker sotuvlar submenu
  const salesSubmenu = useMemo(
    () => ([
      { id: 'new', name: 'Yangi sotuv', icon: PackagePlus },
      { id: 'all', name: 'Barcha sotuvlar', icon: List },
      { id: 'cancelled', name: 'Bekor qilingan', icon: X },
    ]),
    []
  );

  // Broker savatlar submenu
  const basketsSubmenu = useMemo(
    () => ([
      { id: 'new', name: 'Savat turlari', icon: PackagePlus },
      { id: 'distribution', name: 'Savat tarqatish', icon: ArrowRightLeft },
      { id: 'returned', name: 'Qaytarilgan savatlar', icon: RotateCcw },
      { id: 'all', name: 'Savatlar hammasi', icon: List },
    ]),
    []
  );

  // URLga qarab active'larni sinxronlash
  React.useEffect(() => {
    if (user?.role?.includes('BROKER')) {
      // Sales submenu
      if (/\/dashboard\/broker\/sales(\/|$)/.test(location.pathname)) {
        setActiveSection('sales');
        setIsSubmenuOpen(true);
        if (/\/sales\/new$/.test(location.pathname)) setActiveSubSection('new');
        else if (/\/sales\/cancelled$/.test(location.pathname)) setActiveSubSection('cancelled');
        else setActiveSubSection('all');
      }
      // Baskets submenu
      else if (/\/dashboard\/broker\/baskets(\/|$)/.test(location.pathname)) {
        setActiveSection('baskets');
        setIsSubmenuOpen(true);
        if (/\/baskets\/new$/.test(location.pathname)) setActiveSubSection('new');
        else if (/\/baskets\/distribution$/.test(location.pathname)) setActiveSubSection('distribution');
        else if (/\/baskets\/returned$/.test(location.pathname)) setActiveSubSection('returned');
        else setActiveSubSection('all');
      }
    }
  }, [location.pathname, setActiveSection, setIsSubmenuOpen, setActiveSubSection, user]);

  const openSalesSubmenu = () => {
    setActiveSection('sales');
    setIsSubmenuOpen(true);
    setActiveSubSection('all');
    navigate('/dashboard/broker/sales');
  };

  const openBasketsSubmenu = () => {
    setActiveSection('baskets');
    setIsSubmenuOpen(true);
    setActiveSubSection('all');
    navigate('/dashboard/broker/baskets');
  };

  const handleMainClick = (section) => {
    // Broker va Sotuvlar bo'lsa
    if (user.role.includes('BROKER') && section.id === 'sales') {
      openSalesSubmenu();
      return;
    }

    // Broker va Savatlar bo'lsa
    if (user.role.includes('BROKER') && section.id === 'baskets') {
      openBasketsSubmenu();
      return;
    }

    // Oddiy navigatsiya
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
    if (activeSection === 'sales') {
      navigate(`/dashboard/broker/sales/${sub.id}`);
    } else if (activeSection === 'baskets') {
      navigate(`/dashboard/broker/baskets/${sub.id}`);
    }
  };

  const handleBack = () => {
    setIsSubmenuOpen(false);
    navigate('/dashboard/broker');
  };

  // Hozirgi active submenu ro'yxatini tanlash
  const currentSubmenu = activeSection === 'sales' ? salesSubmenu : 
                         activeSection === 'baskets' ? basketsSubmenu : [];

  return (
    <div className="w-64 lg:w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 h-full shadow-sm">
      {/* Top header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hosilim Tizimi
            </h2>
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full mr-2 animate-pulse ${
                  user.role === "ADMIN"
                    ? "bg-red-500"
                    : user.role === "BROKER"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
              <p className="text-sm lg:text-base text-gray-600 font-medium">{user.role}</p>
            </div>
          </div>

          {/* Submenu rejimida "Orqaga" */}
          {isSubmenuOpen && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Orqaga"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main list yoki Submenu list */}
      <nav className="p-3 lg:p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {!isSubmenuOpen ? (
          // Asosiy bo'limlar
          <>
            {sections.map((section) => {
              const hasSubmenu = user.role.includes('BROKER') && 
                                (section.id === 'sales' || section.id === 'baskets');
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleMainClick(section)}
                  className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 mb-1 lg:mb-2 rounded-xl text-sm lg:text-base font-medium transition-all text-left group ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <section.icon className={`w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0 ${
                    activeSection === section.id ? '' : 'group-hover:scale-110 transition-transform'
                  }`} />
                  <span className="truncate">{section.name}</span>

                  {/* Submenu indicator */}
                  {hasSubmenu && (
                    <ChevronLeft className={`ml-auto w-4 h-4 transform rotate-180 ${
                      activeSection === section.id ? 'text-white' : 'text-gray-400'
                    }`} />
                  )}
                </button>
              );
            })}

            <div className="mt-6 lg:mt-8 pt-3 lg:pt-4 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all group"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                Chiqish
              </button>
            </div>
          </>
        ) : (
          // Submenu
          <div>
            <div className="px-3 lg:px-4 py-2.5 lg:py-3 mb-3 flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeSection === 'sales' ? 'Sotuvlar bo\'limi' : 'Savatlar bo\'limi'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentSubmenu.length} ta bo'lim
                </p>
              </div>
            </div>
            
            {currentSubmenu.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubClick(sub)}
                className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 mb-1 lg:mb-2 rounded-xl text-sm lg:text-base font-medium transition-all text-left group ${
                  activeSubSection === sub.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <sub.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${
                  activeSubSection === sub.id ? '' : 'group-hover:scale-110 transition-transform'
                }`} />
                <span className="truncate">{sub.name}</span>
              </button>
            ))}

            <div className="mt-6 lg:mt-8 pt-3 lg:pt-4 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all group"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
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
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
        </div>
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
        { id: 'collection-points', name: 'Yig\'ish punktlari', icon: MapPin },
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
        { id: 'sales', name: 'Sotuvlar', icon: TrendingUp },
        { id: 'baskets', name: 'Savatlar', icon: ShoppingBasket }, // YANGI!
        { id: 'farmers', name: 'Fermerlar', icon: Users },
        { id: 'inventory', name: 'Omborxona', icon: Package },
        { id: 'pricing', name: 'Narx Belgilash', icon: DollarSign },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hosil Tizimi
          </h1>
          <p className="text-sm text-gray-600">{user.role}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
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
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              {/* Default dashboard route */}
              <Route path="/" element={<Navigate to={getRoleBasedRoute()} replace />} />

              {/* Admin routes */}
              <Route path="/admin/*" element={
                user.role && user.role.includes('ADMIN') ? (
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<AdminUsersManagement />} />
                    <Route path="/brokers" element={renderSectionContent()} />
                    <Route path="/collection-points" element={<CollectionPointsPage /> } />
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
                      <Route path="all" element={<AllSalePage />} />
                      <Route path="cancelled" element={<CancelledSalePage />} />
                    </Route>

                    {/* Savatlar: nested - YANGI! */}
                    <Route path="/baskets/*" element={<BrokerBasketsLayout />}>
                      <Route index element={<Navigate to="all" replace />} />
                      <Route path="new" element={<NewBasketsPage />} />
                      <Route path="distribution" element={<BasketDistributionPage />} />
                      <Route path="returned" element={<ReturnedBasketsPage />} />
                      <Route path="all" element={<AllBasketsPage />} />
                    </Route>

                    <Route path="/farmers" element={renderSectionContent()} />
                    <Route path="/inventory" element={renderSectionContent()} />
                    <Route path="/pricing" element={<PricingPage />} />
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