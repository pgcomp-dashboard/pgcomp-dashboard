import useAuth from "@/hooks/auth";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router";

export function EnsureAdmin() {
  const auth = useAuth();

  if (auth?.isLoading) return <Loader2 />;

  return auth?.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
