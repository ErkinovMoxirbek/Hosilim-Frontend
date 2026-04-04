import React, { useMemo, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import AdminLayout from "./layouts/AdminLayout";
import BrokerLayout from "./layouts/BrokerLayout";
import AccountantLayout from "./layouts/AccountantLayout";
import FarmerLayout from "./layouts/FarmerLayout";

export default function DashboardRoutes() {
  const { user, loading } = useAuth();
  const [grace, setGrace] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGrace(false), 600);
    return () => clearTimeout(t);
  }, []);

  const roles = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user?.roles)) return user.roles;
    if (Array.isArray(user?.role)) return user.role;
    if (typeof user?.role === "string" && user.role.trim()) return [user.role];
    return [];
  }, [user]);

  const hasRole = (key) =>
    roles.some((r) => String(r).toUpperCase().includes(key));

  const defaultRoute = () => {
    if (hasRole("ADMIN")) return "/dashboard/admin";
    if (hasRole("ACCOUNTANT")) return "/dashboard/accountant";
    if (hasRole("BROKER")) return "/dashboard/broker";
    return "/dashboard/farmer";
  };

  if (loading || (grace && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute()} replace />} />

      <Route
        path="/admin/*"
        element={
          hasRole("ADMIN") ? (
            <AdminLayout />
          ) : (
            <Navigate to={defaultRoute()} replace />
          )
        }
      />

      <Route
        path="/broker/*"
        element={
          hasRole("BROKER") ? (
            <BrokerLayout />
          ) : (
            <Navigate to={defaultRoute()} replace />
          )
        }
      />
      
      <Route
        path="/accountant/*"
        element={
          hasRole("ACCOUNTANT") ? (
            <AccountantLayout />
          ) : (
            <Navigate to={defaultRoute()} replace />
          )
        }
      />

      <Route
        path="/farmer/*"
        element={
          hasRole("FARMER") ? (
            <FarmerLayout />
          ) : (
            <Navigate to={defaultRoute()} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={defaultRoute()} replace />} />
    </Routes>
  );
}