import useAuth from "@/hooks/auth";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router";

export function EnsureManager() {
  const auth = useAuth();

  if (auth?.isLoading) return <Loader2 className="animate-spin" />;

  return auth?.isManager ? <Outlet /> : <Navigate to="/" replace />;
}
