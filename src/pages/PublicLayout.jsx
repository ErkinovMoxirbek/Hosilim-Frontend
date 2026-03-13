// src/pages/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <main>
        <Outlet />
      </main>

      <PublicFooter />
        
    </div>
  );
}
