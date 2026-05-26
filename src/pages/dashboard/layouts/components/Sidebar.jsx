import { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, LogOut, ShoppingBasket, Users, 
  Package, DollarSign, Settings, List, PackagePlus, 
  ArrowRightLeft, ArrowLeft, Download, History, 
  RefreshCcw, XCircle, Database, Truck, Apple, BarChart3, 
  MapPin, Briefcase, Home, ClipboardList, 
  ThermometerSnowflake, Tractor, Tag, Megaphone, User,
  ServerCog, Wallet, Banknote, FileText, PackageCheck, CreditCard
} from "lucide-react";

function getBasePath(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
  const hasRole = (key) => roles.some((r) => String(r).toUpperCase().includes(key));

  if (hasRole("ADMIN")) return "/dashboard/admin";
  if (hasRole("ACCOUNTANT")) return "/dashboard/accountant";
  if (hasRole("BROKER")) return "/dashboard/broker";
  return "/dashboard/farmer";
}

// Rollarni chiroyli va rangli qilib chiqaruvchi funksiya
const getRoleBadge = (role) => {
  const r = String(role || "GUEST").toUpperCase();
  if (r.includes('ADMIN')) return <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-rose-100">ADMIN</span>;
  if (r.includes('BROKER')) return <span className="text-[#0081C9] bg-blue-50 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-blue-100">BROKER</span>;
  if (r.includes('ACCOUNTANT')) return <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-emerald-100">HISOBCHI</span>;
  if (r.includes('FARMER')) return <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-orange-100">FERMER</span>;
  return <span className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-gray-200">{r}</span>;
}

export default function Sidebar({ user, onLogout }) {
  const basePath = useMemo(() => getBasePath(user), [user]);
  const location = useLocation();

  const isAdmin = basePath.includes("admin");
  const isAccountant = basePath.includes("accountant");
  const isBroker = basePath.includes("broker");
  const isFarmer = basePath.includes("farmer");

  const [currentView, setCurrentView] = useState("main");

  // 🟢 XATO SHU YERDA EDI! TARTIBI VA MANTIQ TOG'RILANDI
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes("/receive")) {
      setCurrentView("receive");
    } else if (path.includes("/baskets")) {
      setCurrentView("baskets");
    } else if (path.includes("/inventory")) {
      setCurrentView("inventory");
    } else if (path.includes("/exporters")) {
      // 🟢 Exporters doim birinchi tekshiriladi
      setCurrentView("exporters"); 
    } else if (path.includes("/finance") || (path.includes("/report") && !path.includes("/exporters"))) {
      // 🟢 Report faqat Exporters bo'lmaganda Finance ni ochadi
      setCurrentView("finance");
    } else {
      setCurrentView("main");
    }
  }, [location.pathname]);

  let mainItems = [];

  if (isAdmin) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: Home, to: basePath },
      { id: "exporters", label: "Eksport (Hamkorlar)", icon: Briefcase, hasSubMenu: true }, 
      { id: "announcements", label: "E'lonlar", icon: Megaphone, to: `${basePath}/announcements` }, 
      { id: "fruit-types", label: "Meva Katalogi", icon: Database, to: `${basePath}/fruit-types` },
      { id: "collection-points", label: "Yig'ish Punktlari", icon: MapPin, to: `${basePath}/collection-points` },
      { id: "users", label: "Foydalanuvchilar", icon: Users, to: `${basePath}/users` },
      { id: "brokers", label: "Brokerlar", icon: Truck, to: `${basePath}/brokers` },
      { id: "farmers", label: "Fermerlar", icon: Apple, to: `${basePath}/farmers` },
      { id: "transactions", label: "Moliya bo'limi", icon: DollarSign, to: `${basePath}/transactions` },
      { id: "analytics", label: "Statistika", icon: BarChart3, to: `${basePath}/analytics` },
      { id: "settings", label: "Sozlamalar", icon: Settings, to: `${basePath}/settings` },
    ];
  } else if (isAccountant) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: Home, to: basePath },
      { id: "baskets", label: "Savatlar", icon: ShoppingBasket, hasSubMenu: true },
      { id: "receive", label: "Qabullar", icon: ClipboardList, hasSubMenu: true },
      { id: "inventory", label: "Haladelnik", icon: ThermometerSnowflake, hasSubMenu: true },
      { id: "farmers", label: "Fermerlar", icon: Tractor, to: `${basePath}/farmers` },
      { id: "pricing", label: "Narxlar", icon: Tag, to: `${basePath}/pricing` },
      { id: "announcements", label: "E'lonlar", icon: Megaphone, to: `${basePath}/announcements` }, 
      { id: "profile", label: "Profil", icon: User, to: `${basePath}/profile` },
    ];
  } else if (isBroker) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: Home, to: basePath },
      { id: "baskets", label: "Savatlar", icon: ShoppingBasket, hasSubMenu: true },
      { id: "receive", label: "Qabullar", icon: ClipboardList, hasSubMenu: true },
      { id: "inventory", label: "Muzlatgich", icon: ThermometerSnowflake, hasSubMenu: true },
      { id: "exporters", label: "Eksport (Hamkorlar)", icon: Briefcase, hasSubMenu: true }, 
      { id: "finance", label: "Moliya bo'limi", icon: Wallet, hasSubMenu: true }, 
      { id: "farmers", label: "Fermerlar", icon: Tractor, to: `${basePath}/farmers` },
      { id: "accountants", label: "Hisobchilar", icon: Users, to: `${basePath}/accountants` },
      { id: "pricing", label: "Narxlar", icon: Tag, to: `${basePath}/pricing` },
      { id: "announcements", label: "E'lonlar", icon: Megaphone, to: `${basePath}/announcements` }, 
      { id: "profile", label: "Profil", icon: User, to: `${basePath}/profile` },
    ];
  } else if (isFarmer) {
    mainItems = [
      { id: "dashboard", label: "Bosh sahifa", icon: Home, to: basePath },
      { id: "inventory", label: "Haladelnik", icon: ThermometerSnowflake, hasSubMenu: true },
      { id: "announcements", label: "E'lonlar", icon: Megaphone, to: `${basePath}/announcements` }, 
      { id: "profile", label: "Profil", icon: User, to: `${basePath}/profile` },
    ];
  }

  const subMenus = {
    receive: {
      title: "Hosil Qabuli",
      icon: Download,
      items: [
        { id: "new", label: "Yangi Qabul", icon: PackagePlus, to: `${basePath}/receive/new` },
        { id: "all", label: "Kirimlar Tarixi", icon: List, to: `${basePath}/receive/all` },
        { id: "warehouse", label: "Omborxona", icon: Database, to: `${basePath}/receive/warehouse` },
        { id: "cancelled", label: "Bekor Qilinganlar", icon: XCircle, to: `${basePath}/receive/cancelled` },
      ]
    },
    baskets: {
      title: "Savatlar",
      icon: ShoppingBasket,
      items: [
        { id: "catalog", label: "Ombor (Savat turlari)", icon: Package, to: `${basePath}/baskets/catalog` },
        { id: "distribution", label: "Savat Tarqatish", icon: ArrowRightLeft, to: `${basePath}/baskets/distribution` },
        { id: "balances", label: "Fermerlar Qarzi", icon: Briefcase, to: `${basePath}/baskets/balances` }, 
        { id: "transaction", label: "Savatlar Aylanmasi", icon: RefreshCcw, to: `${basePath}/baskets/transaction` }, 
        { id: "history", label: "Umumiy Tarix", icon: History, to: `${basePath}/baskets/history` },
      ]
    },
    inventory: {
      title: "Haladelnik",
      icon: ThermometerSnowflake,
      items: [
        { id: "stocks", label: "Muzlatgichdagi Yuklar", icon: Package, to: `${basePath}/inventory/stocks` },
        { id: "manage", label: "Muzlatgich Boshqaruvi", icon: ServerCog, to: `${basePath}/inventory/manage` },
        { id: "history", label: "Kirim-Chiqim Tarixi", icon: History, to: `${basePath}/inventory/history` },
      ]
    },
    exporters: {
      title: "Eksport va Hamkorlar",
      icon: Briefcase,
      items: [
        { id: "report", label: "Hamkorlar & Hisobot", icon: Users, to: `${basePath}/exporters/report` },
        { id: "history", label: "Jo'natilgan Yuklar (Tarix)", icon: PackageCheck, to: `${basePath}/exporters/history` },
        { id: "payments", label: "To'lov Qabul Qilish", icon: CreditCard, to: `${basePath}/exporters/payments` },
        { id: "payment-history", label: "To'lovlar Tarixi", icon: FileText, to: `${basePath}/exporters/payment-history` },
      ]
    },
    finance: {
      title: "Moliya bo'limi",
      icon: Wallet,
      items: [
<<<<<<< HEAD
        { id: "debts", label: "To'lov", icon: Banknote, to: `${basePath}/finance/debts` },
        { id: "report", label: "Hisobotlar", icon: BarChart3, to: `${basePath}/finance/report` }, 
        { id: "history", label: "To'lovlar Tarixi", icon: FileText, to: `${basePath}/finance/history` },
=======
        { id: "debts", label: "Fermerga To'lov", icon: Banknote, to: `${basePath}/finance/debts` },
        { id: "report", label: "Fermer Hisobotlar", icon: BarChart3, to: `${basePath}/report` },
        { id: "history", label: "Fermer To'lov Tarixi", icon: FileText, to: `${basePath}/finance/history` },
>>>>>>> bb7c3f3413f83bc9a4802ecdd3a0696bb9fabf7b
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
          <span className="text-[10px] font-black text-green-500 tracking-widest uppercase mt-0.5">
            AGRO PLATFORMA
          </span>
        </div>
      </div>

      {/* 2. Dinamik Navigation Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
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
                const isActive = location.pathname === item.to || (item.to !== basePath && location.pathname.startsWith(item.to));

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
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-gray-200 cursor-pointer shadow-sm hover:shadow transition-all mb-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#0B1A42] flex items-center justify-center text-white font-black text-[16px] shadow-inner">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <span className="text-[14px] font-black text-[#0B1A42] truncate leading-tight mb-1">
              {user?.name || "Foydalanuvchi"}
            </span>
            <div>
              {getRoleBadge(user?.role)}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{ textDecoration: 'none' }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors font-medium group border border-transparent"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
}