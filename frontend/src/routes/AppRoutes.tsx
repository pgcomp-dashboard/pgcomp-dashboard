import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import AdminLayout from "@/layouts/admin/admin-layout";
import CredenciamentoPage from "@/pages/admin/accreditation";
import AreasPage from "@/pages/admin/areas";
import ProfessorsPage from "@/pages/admin/professors";
import PublishersPage from "@/pages/admin/publishers";
import QualisPage from "@/pages/admin/qualis/index";
import StudentsPage from "@/pages/admin/students";
import SystemConfigPage from "@/pages/admin/system-config";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import LoginPage from "@/pages/auth/login";
import ResetPasswordPage from "@/pages/auth/reset-password";
import NotFoundPage from "@/pages/not-found";
import ProductionsPage from "@/pages/user/productions";
import UserConfigPage from "@/pages/user/user-config";
import WelcomePage from "@/pages/user/welcome";

import { EnsureAdmin } from "./guards/EnsureAdmin";
import { EnsureAuthenticated } from "./guards/EnsureAuthenticated";

const DashboardPage = lazy(() => import("@/pages/admin/dashboard"));

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />

      {/* Rotas Protegidas (Geral) */}
      <Route element={<EnsureAuthenticated />}>
        <Route
          element={
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          }
        >
          <Route index element={<WelcomePage />} />
          <Route path="portal">
            <Route index element={<Navigate to="/" replace />} />
            <Route path="credenciamento" element={<CredenciamentoPage />} />
            <Route path="productions" element={<ProductionsPage />} />
            <Route path="user-config" element={<UserConfigPage />} />
          </Route>

          {/* Rotas restritas apenas para ADMIN */}
          <Route path="admin" element={<EnsureAdmin />}>
            <Route index element={<Navigate to="/" replace />} />
            <Route path="areas" element={<AreasPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="professors" element={<ProfessorsPage />} />
            <Route path="publishers" element={<PublishersPage />} />
            <Route path="qualis" element={<QualisPage />} />
            <Route path="system-config" element={<SystemConfigPage />} />
          </Route>
        </Route>
        <Route path="admin" element={<EnsureAdmin />}>
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <DashboardPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
