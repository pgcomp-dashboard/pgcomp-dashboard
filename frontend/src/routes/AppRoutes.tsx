import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";

import ProjectDashboardPage from "@/pages/admin/projects-dashboard";
import ProjectsPage from "@/pages/user/projects";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import AdminLayout from "@/layouts/admin/admin-layout";
import CredenciamentoPage from "@/pages/admin/accreditation";
import AreasPage from "@/pages/admin/areas";
import LattesUploadsPage from "@/pages/admin/lattes-uploads";
import ProfessorsPage from "@/pages/admin/professors";
import PublishersPage from "@/pages/admin/publishers";
import QualisPage from "@/pages/admin/qualis/index";
import StudentsPage from "@/pages/admin/students";
import SystemConfigPage from "@/pages/admin/system-config";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ResetPasswordPage from "@/pages/auth/reset-password";
import WaitingApprovalPage from "@/pages/auth/waiting-approval";
import NotFoundPage from "@/pages/not-found";
import ProductionsPage from "@/pages/user/productions";
import ProfilePage from "@/pages/user/profile";
import WelcomePage from "@/pages/user/welcome";

import RulesPage from "@/pages/admin/rules";
import { EnsureAdmin } from "./guards/EnsureAdmin";
import { EnsureAuthenticated } from "./guards/EnsureAuthenticated";
import { EnsureIsApproved } from "./guards/EnsureIsApproved";
import { EnsureManager } from "./guards/EnsureManager";

const DashboardPage = lazy(() => import("@/pages/admin/dashboard"));

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="register" element={<RegisterPage />} />
      {/* Rotas Protegidas (Geral) */}
      <Route element={<EnsureAuthenticated />}>
        <Route path="waiting-approval" element={<WaitingApprovalPage />} />
        <Route element={<EnsureIsApproved />}>
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
              <Route path="productions" element={<ProductionsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            {/* Rotas restritas apenas para ADMIN */}
            <Route path="admin" element={<EnsureAdmin />}>
              <Route index element={<Navigate to="/" replace />} />
              <Route path="areas" element={<AreasPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="credenciamento" element={<CredenciamentoPage />} />
              <Route path="projects-dashboard" element={<ProjectDashboardPage />} />
              <Route path="professors" element={<ProfessorsPage />} />
              <Route path="publishers" element={<PublishersPage />} />
              <Route path="qualis" element={<QualisPage />} />
              <Route path="rules" element={<RulesPage />} />
              <Route path="system-config" element={<SystemConfigPage />} />
              <Route element={<EnsureManager />}>
                <Route path="lattes-uploads" element={<LattesUploadsPage />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="admin/dashboard"
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
