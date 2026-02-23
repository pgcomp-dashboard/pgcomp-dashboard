import useAuth from "@/hooks/auth";
import { Navigate, Outlet } from "react-router";

export function EnsureIsApproved() {
  const auth = useAuth();
  const user = auth?.user;

  if (auth?.isLoading) {
    return <>Carregando...</>;
  }

  if (user && user.is_approved) {
    return <Outlet />;
  } else {
    console.error("User not approved. Redirecting to waiting approval page...");
    return <Navigate to="/waiting-approval" replace />;
  }
}
