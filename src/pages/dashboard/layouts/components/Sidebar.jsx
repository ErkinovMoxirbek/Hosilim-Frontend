import { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LogOut,
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
  LayoutGrid,
  ArrowLeft
} from "lucide-react";

function getBasePath(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
  const hasRole = (key) => roles.some((r) => String(r).toUpperCase().includes(key));

  if (hasRole("ADMIN")) return "/dashboard/admin";
  if (hasRole("ACCOUNTANT")) return "/dashboard/accountant";
  if (hasRole("BROKER")) return "/dashboard/broker";
  return "/dashboard/farmer";
}

export default function Sidebar({ user, onLogout }) {
  const basePath = useMemo(() => getBasePath(user), [user]);
  const location = useLocation();

  const isAdmin = basePath.includes("admin");
  const isAccountant = basePath.includes("accountant");
  const isBroker = basePath.includes("broker");
  const isFarmer = basePath.includes("farmer");

  const [currentView, setCurrentView] = useState("main");

  useEffect(() => {
    if (location.pathname.includes("/sales")) setCurrentView("sales");
    else if (location.pathname.includes("/baskets")) setCurrentView("baskets");
    else setCurrentView("main");
  }, [location.pathname]);

  let mainItems = [];

  if (isAdmin) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: LayoutGrid, to: basePath },
      { id: "accountants", label: "Hisobchilar", icon: Users, to: `${basePath}/accountants` },
      { id: "farmers", label: "Fermerlar", icon: Users, to: `${basePath}/farmers` },
      { id: "inventory", label: "Omborxona", icon: Package, to: `${basePath}/inventory` },
      { id: "profile", label: "Profil", icon: Settings, to: `${basePath}/profile` },
    ];
  } else if (isAccountant) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: LayoutGrid, to: basePath },
      { id: "sales", label: "Sotuvlar", icon: TrendingUp, hasSubMenu: true },
      { id: "baskets", label: "Savatlar", icon: ShoppingBasket, hasSubMenu: true },
      { id: "farmers", label: "Fermerlar", icon: Users, to: `${basePath}/farmers` },
      { id: "inventory", label: "Omborxona", icon: Package, to: `${basePath}/inventory` },
      { id: "pricing", label: "Narx belgilash", icon: DollarSign, to: `${basePath}/pricing` },
      { id: "profile", label: "Profil", icon: Settings, to: `${basePath}/profile` },
    ];
  } else if (isBroker) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: LayoutGrid, to: basePath },
      { id: "sales", label: "Sotuvlar", icon: TrendingUp, hasSubMenu: true },
      { id: "baskets", label: "Savatlar", icon: ShoppingBasket, hasSubMenu: true },
      { id: "accountants", label: "Hisobchilar", icon: Users, to: `${basePath}/accountants` },
      { id: "farmers", label: "Fermerlar", icon: Users, to: `${basePath}/farmers` },
      { id: "inventory", label: "Omborxona", icon: Package, to: `${basePath}/inventory` },
      { id: "pricing", label: "Narx belgilash", icon: DollarSign, to: `${basePath}/pricing` },
      { id: "profile", label: "Profil", icon: Settings, to: `${basePath}/profile` },
    ];
  } else if (isFarmer) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: LayoutGrid, to: basePath },
      { id: "inventory", label: "Omborxona", icon: Package, to: `${basePath}/inventory` },
      { id: "profile", label: "Profil", icon: Settings, to: `${basePath}/profile` },
    ];
  }

  const subMenus = {
    sales: {
      title: "Sotuvlar",
      icon: TrendingUp,
      items: [
        { id: "new", label: "Yangi sotuv", icon: PackagePlus, to: `${basePath}/sales/new` },
        { id: "all", label: "Barcha sotuvlar", icon: List, to: `${basePath}/sales/all` },
        { id: "cancelled", label: "Bekor qilingan", icon: X, to: `${basePath}/sales/cancelled` },
      ]
    },
    baskets: {
      title: "Savatlar",
      icon: ShoppingBasket,
      items: [
        { id: "catalog", label: "Savat turlari", icon: PackagePlus, to: `${basePath}/baskets/catalog` },
        { id: "distribution", label: "Savat tarqatish", icon: ArrowRightLeft, to: `${basePath}/baskets/distribution` },
        { id: "returned", label: "Qaytarilgan savatlar", icon: RotateCcw, to: `${basePath}/baskets/returned` },
        { id: "history", label: "Savatlar tarixi", icon: List, to: `${basePath}/baskets/history` },
      ]
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction === "forward" ? 15 : -15, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction === "forward" ? -15 : 15, opacity: 0 }),
  };

  const direction = currentView === "main" ? "back" : "forward";

  return (
    // 🚀 MUHIM O'ZGARISH: `sticky top-0` o'rniga `fixed top-0 left-0` ishlatildi
    <aside className="fixed top-0 left-0 h-screen w-[270px] bg-white border-r border-gray-100 flex flex-col text-[14px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">

      {/* 1. Header / Logo */}
      <div className="flex items-center gap-3 px-6 py-6 shrink-0 border-b border-gray-50 mb-2">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <img src="/logo-white.png" alt="Logo" className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[#0B1A42] tracking-wide text-[20px] leading-none mb-0.5">
            Hosilim
          </span>
          <span className="text-[10px] font-bold text-[#0081C9] tracking-widest uppercase">
            {String(user?.role || "TIZIMI").replace('_', ' ')} TIZIMI
          </span>
        </div>
      </div>

      {/* 2. Dinamik Navigation Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">

          {/* ASOSIY MENYU */}
          {currentView === "main" && (
            <motion.nav
              key="main"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="absolute inset-0 px-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                if (item.hasSubMenu) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      style={{ textDecoration: 'none' }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all outline-none text-gray-600 hover:text-[#0B1A42] hover:bg-gray-50 font-medium group border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="text-gray-400 group-hover:text-[#14A44D]" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.id === "dashboard"}
                    style={{ textDecoration: 'none' }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all outline-none border ${isActive
                      ? "bg-[#14A44D]/10 text-[#000] border-[#14A44D]/20 font-bold"
                      : "text-gray-600 hover:text-[#16a34a] hover:bg-gray-50 font-medium border-transparent"
                      }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#14A44D]" : "text-gray-400"} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </motion.nav>
          )}

          {/* IKKILAMCHI MENYU */}
          {currentView !== "main" && (
            <motion.nav
              key={currentView}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col px-3"
            >
              <button
                onClick={() => setCurrentView("main")}
                style={{ textDecoration: 'none' }}
                className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-[#0B1A42] hover:bg-gray-50 transition-colors group w-fit border border-transparent"
              >
                <ArrowLeft size={16} className="text-gray-400 group-hover:-translate-x-1 transition-transform" />
                <span>Asosiy menyu</span>
              </button>

              <div className="px-3 mb-3 mt-1">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subMenus[currentView].title}</h3>
              </div>

              <div className="space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
                {subMenus[currentView].items.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.to;
                  return (
                    <NavLink
                      key={sub.id}
                      to={sub.to}
                      style={{ textDecoration: 'none' }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all outline-none border ${isSubActive
                        ? "bg-[#14A44D]/10 text-[#14A44D] border-[#14A44D]/20 font-bold"
                        : "text-gray-600 hover:text-[#0B1A42] hover:bg-gray-50 font-medium border-transparent group"
                        }`}
                    >
                      <SubIcon size={20} strokeWidth={isSubActive ? 2.5 : 2} className={isSubActive ? "text-[#14A44D]" : "text-gray-400 group-hover:text-[#14A44D]"} />
                      <span>{sub.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.nav>
          )}

        </AnimatePresence>
      </div>

      {/* 3. Footer / User Profile */}
      <div className="p-4 mt-auto border-t border-gray-100 shrink-0 bg-white z-10 relative">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50/50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
          <div className="w-9 h-9 rounded-lg bg-[#0B1A42] flex items-center justify-center text-white font-bold text-[14px]">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-bold text-[#0B1A42] truncate leading-tight">
              {user?.name || "Foydalanuvchi"}
            </span>
            <span className="text-[11px] text-[#0081C9] mt-0.5 uppercase tracking-wider truncate font-semibold">
              {String(user?.role || "GUEST").replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{ textDecoration: 'none' }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium group border border-transparent"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
}