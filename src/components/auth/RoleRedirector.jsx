import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUser } from "../../utils/tokenManager";

export default function RoleRedirector() {
  const { loading } = useAuth();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const roles = user.roles || [];


    if (roles.includes("FERMER") || roles.includes("ROLE_FERMER")) {
      navigate("/fermer", { replace: true });
      return;
    }

    if (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN")) {
      navigate("/admin", { replace: true });
      return;
    }

    if (roles.includes("BROKER") || roles.includes("ROLE_BROKER")) {
      navigate("/broker", { replace: true });
      return;
    }

    // Role yo‘q bo‘lsa ham fallback
    navigate("/", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-gray-600">Yo‘naltirilmoqda...</p>
    </div>
  );
}
