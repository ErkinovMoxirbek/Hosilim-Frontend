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
  if (hasRole("BIG_BROKER")) return "/dashboard/big-broker";
  if (hasRole("BROKER")) return "/dashboard/broker";
  return "/dashboard/farmer";
}

export default function Sidebar({ user, onLogout }) {
  const basePath = useMemo(() => getBasePath(user), [user]);
  const location = useLocation();
  const isBrokerLike = basePath.includes("broker");
  
  // "main", "sales" yoki "baskets" holatlarini ushlab turadi
  const [currentView, setCurrentView] = useState("main");

  // Sahifa yangilanganda kerakli menyuni ochiq qoldirish
  useEffect(() => {
    if (location.pathname.includes("/sales")) setCurrentView("sales");
    else if (location.pathname.includes("/baskets")) setCurrentView("baskets");
    else setCurrentView("main");
  }, []);

  const mainItems = [
    { id: "dashboard", label: "Bosh sahifa", icon: LayoutGrid, to: basePath },
    ...(isBrokerLike ? [
      { id: "sales", label: "Sotuvlar", icon: TrendingUp, hasSubMenu: true },
      { id: "baskets", label: "Savatlar", icon: ShoppingBasket, hasSubMenu: true },
    ] : []),
    { id: "accountants", label: "Hisobchilar", icon: Users, to: `${basePath}/accountants` },
    { id: "farmers", label: "Fermerlar", icon: Users, to: `${basePath}/farmers` },
    { id: "inventory", label: "Omborxona", icon: Package, to: `${basePath}/inventory` },
    { id: "pricing", label: "Narx belgilash", icon: DollarSign, to: `${basePath}/pricing` },
    { id: "profile", label: "Profil", icon: Settings, to: `${basePath}/profile` },
  ];

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
        { id: "new", label: "Savat turlari", icon: PackagePlus, to: `${basePath}/baskets/new` },
        { id: "distribution", label: "Savat tarqatish", icon: ArrowRightLeft, to: `${basePath}/baskets/distribution` },
        { id: "returned", label: "Qaytarilgan savatlar", icon: RotateCcw, to: `${basePath}/baskets/returned` },
        { id: "all", label: "Barchasi", icon: List, to: `${basePath}/baskets/all` },
      ]
    }
  };

  // Animatsiya sozlamalari (O'ngdan chapga siljish)
  const variants = {
    enter: (direction) => ({
      x: direction === "forward" ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "forward" ? -20 : 20,
      opacity: 0,
    }),
  };

  // Animatsiya yo'nalishini aniqlash
  const direction = currentView === "main" ? "back" : "forward";

  return (
    // 🟢 ASOSIY O'ZGARISH: fixed -> sticky, left-0 olib tashlandi, z-50 olib tashlandi 🟢
    <aside className="sticky top-0 h-screen w-[260px] bg-white border-r border-zinc-200 flex flex-col text-[14px] overflow-hidden">
      
      {/* 1. Header / Logo */}
      <div className="flex items-center gap-3 px-5 py-6 mb-2 shrink-0">
        <div className="w-6 h-6 bg-[#16A34A] rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-[12px] leading-none">H</span>
        </div>
        <span className="font-semibold text-zinc-900 tracking-tight text-[15px]">Hosilim</span>
      </div>

      {/* 2. Dinamik Navigation Area */}
      <div className="flex-1 relative">
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
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 px-3 space-y-0.5 overflow-y-auto custom-scrollbar"
            >
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                if (item.hasSubMenu) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors outline-none text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.id === "dashboard"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors outline-none ${
                      isActive 
                      ? "bg-zinc-100 text-zinc-900 font-medium" 
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-zinc-900" : "text-zinc-400"} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </motion.nav>
          )}

          {/* IKKILAMCHI MENYU (Sotuvlar / Savatlar) */}
          {currentView !== "main" && (
            <motion.nav
              key={currentView}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col px-3"
            >
              {/* Orqaga qaytish tugmasi */}
              <button
                onClick={() => setCurrentView("main")}
                className="flex items-center gap-2 px-2 py-2 mb-4 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Asosiy menyu</span>
              </button>

              <div className="px-3 mb-3">
                <h3 className="text-zinc-900 font-semibold text-[15px]">{subMenus[currentView].title}</h3>
              </div>

              <div className="space-y-0.5 overflow-y-auto custom-scrollbar flex-1">
                {subMenus[currentView].items.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.to;
                  return (
                    <NavLink
                      key={sub.id}
                      to={sub.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors outline-none ${
                        isSubActive 
                        ? "bg-zinc-100 text-zinc-900 font-medium" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium group"
                      }`}
                    >
                      <SubIcon size={18} className={isSubActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"} />
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
      <div className="p-3 mt-auto border-t border-zinc-200 shrink-0 bg-white z-10 relative">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-zinc-200/50 flex items-center justify-center text-zinc-700 font-semibold text-[13px]">
            {user?.name?.charAt(0) || "M"}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-zinc-900 truncate leading-tight">
              {user?.name || "MOxirbke"}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide truncate">
              {String(user?.role || "BIG_BROKER").replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={18} className="text-zinc-400 group-hover:text-red-500" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
}