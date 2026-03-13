import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";

const Sidebar = ({
  user,
  sections,
  activeSection,
  setActiveSection,
  onLogout,
  isSubmenuOpen,
  setIsSubmenuOpen,
  activeSubSection,
  setActiveSubSection,
  salesSubmenu = [],
  basketsSubmenu = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // URLga qarab active'larni sinxronlash (BROKER submenu)
  React.useEffect(() => {
    if (!user?.role?.includes("BROKER")) return;

    // Sales
    if (/\/dashboard\/broker\/sales(\/|$)/.test(location.pathname)) {
      setActiveSection("sales");
      setIsSubmenuOpen(true);

      if (/\/sales\/new$/.test(location.pathname)) setActiveSubSection("new");
      else if (/\/sales\/cancelled$/.test(location.pathname))
        setActiveSubSection("cancelled");
      else setActiveSubSection("all");
    }
    // Baskets
    else if (/\/dashboard\/broker\/baskets(\/|$)/.test(location.pathname)) {
      setActiveSection("baskets");
      setIsSubmenuOpen(true);

      if (/\/baskets\/new$/.test(location.pathname)) setActiveSubSection("new");
      else if (/\/baskets\/distribution$/.test(location.pathname))
        setActiveSubSection("distribution");
      else if (/\/baskets\/returned$/.test(location.pathname))
        setActiveSubSection("returned");
      else setActiveSubSection("all");
    }
  }, [
    location.pathname,
    setActiveSection,
    setIsSubmenuOpen,
    setActiveSubSection,
    user,
  ]);

  const handleBack = () => {
    setIsSubmenuOpen(false);
    navigate("/dashboard/broker");
  };

  const openSalesSubmenu = () => {
    setActiveSection("sales");
    setIsSubmenuOpen(true);
    setActiveSubSection("all");
    navigate("/dashboard/broker/sales/all");
  };

  const openBasketsSubmenu = () => {
    setActiveSection("baskets");
    setIsSubmenuOpen(true);
    setActiveSubSection("all");
    navigate("/dashboard/broker/baskets/all");
  };

  const handleMainClick = (section) => {
    // BROKER submenu bo'limlari
    if (user?.role?.includes("BROKER") && section.id === "sales") {
      openSalesSubmenu();
      return;
    }
    if (user?.role?.includes("BROKER") && section.id === "baskets") {
      openBasketsSubmenu();
      return;
    }

    setActiveSection(section.id);
    setIsSubmenuOpen(false);

    if (user?.role?.includes("ADMIN")) {
      navigate(section.id === "dashboard" ? "/dashboard/admin" : `/dashboard/admin/${section.id}`);
      return;
    }
    if (user?.role?.includes("BROKER")) {
      navigate(section.id === "dashboard" ? "/dashboard/broker" : `/dashboard/broker/${section.id}`);
      return;
    }
    // FARMER
    navigate(section.id === "dashboard" ? "/dashboard/farmer" : `/dashboard/farmer/${section.id}`);
  };

  const handleSubClick = (sub) => {
    setActiveSubSection(sub.id);
    if (activeSection === "sales") navigate(`/dashboard/broker/sales/${sub.id}`);
    if (activeSection === "baskets") navigate(`/dashboard/broker/baskets/${sub.id}`);
  };

  const currentSubmenu = useMemo(() => {
    if (activeSection === "sales") return salesSubmenu;
    if (activeSection === "baskets") return basketsSubmenu;
    return [];
  }, [activeSection, salesSubmenu, basketsSubmenu]);

  const roleLabel = user?.role || "—";

  return (
    <div className="w-64 lg:w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 h-full shadow-sm">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hosilim Tizimi
            </h2>
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full mr-2 animate-pulse ${
                  roleLabel.includes("ADMIN")
                    ? "bg-red-500"
                    : roleLabel.includes("BROKER")
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
              <p className="text-sm lg:text-base text-gray-600 font-medium">{roleLabel}</p>
            </div>
          </div>

          {isSubmenuOpen && user?.role?.includes("BROKER") && (
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

      {/* Menu */}
      <nav className="p-3 lg:p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {!isSubmenuOpen ? (
          <>
            {sections.map((section) => {
              const hasSubmenu =
                user?.role?.includes("BROKER") && (section.id === "sales" || section.id === "baskets");

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
                  <section.icon
                    className={`w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0 ${
                      activeSection === section.id ? "" : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="truncate">{section.name}</span>

                  {hasSubmenu && (
                    <ChevronLeft
                      className={`ml-auto w-4 h-4 transform rotate-180 ${
                        activeSection === section.id ? "text-white" : "text-gray-400"
                      }`}
                    />
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
          <>
            <div className="px-3 lg:px-4 py-2.5 lg:py-3 mb-3 flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeSection === "sales" ? "Sotuvlar bo'limi" : "Savatlar bo'limi"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{currentSubmenu.length} ta bo'lim</p>
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
                <sub.icon
                  className={`w-4 h-4 mr-3 flex-shrink-0 ${
                    activeSubSection === sub.id ? "" : "group-hover:scale-110 transition-transform"
                  }`}
                />
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
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
