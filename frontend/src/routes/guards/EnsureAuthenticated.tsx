import useAuth from "@/hooks/auth";
import { Navigate, Outlet, useLocation } from "react-router";

export function EnsureAuthenticated() {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.isLoading) {
    return <>Carregando...</>;
  }

  if (auth?.isAuthenticated) {
    return <Outlet />;
  } else {
    console.error("User not authenticated. Redirecting back to login page...");
    // Volta para onde estava depois de entrar (ex.: sessão expirou no meio do formulário).
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
}
