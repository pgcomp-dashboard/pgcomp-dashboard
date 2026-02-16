import useAuth from "@/hooks/auth";
import { Navigate, Outlet } from "react-router";

export function EnsureAuthenticated() {
  const auth = useAuth();

  if (auth?.isLoading) {
    return <>Carregando...</>;
  }

  if (auth?.isAuthenticated) {
    return <Outlet />;
  } else {
    console.error("User not authenticated. Redirecting back to login page...");
    return <Navigate to="/login" replace />;
  }
}
