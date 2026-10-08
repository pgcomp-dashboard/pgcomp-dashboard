import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import AdminLayout from "@/layouts/admin/admin-layout";
import CredenciamentoPage from "@/pages/admin/accreditation";
import AreasPage from "@/pages/admin/areas";
import AwardsPage from "@/pages/admin/awards";
import FeaturedProductionsPage from "@/pages/admin/featured-productions";
import InternationalizationAdminPage from "@/pages/admin/internationalization";
import LattesUploadsPage from "@/pages/admin/lattes-uploads";
import OrientacoesPage from "@/pages/admin/orientacoes";
import ProfessorsPage from "@/pages/admin/professors";
import ProjectDashboardPage from "@/pages/admin/projects-dashboard";
import PublishersPage from "@/pages/admin/publishers";
import QualisPage from "@/pages/admin/qualis/index";
import StudentRankingPage from "@/pages/admin/student-ranking";
import StudentRequestsPage from "@/pages/admin/student/requests";
import StudentRulesPage from "@/pages/admin/student/rules";
import StudentsPage from "@/pages/admin/students";
import SystemConfigPage from "@/pages/admin/system-config";
import AdminUsersPage from "@/pages/admin/users";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ResetPasswordPage from "@/pages/auth/reset-password";
import StudentRegistrationSentPage from "@/pages/auth/student-registration-sent";
import StudentSetPasswordPage from "@/pages/auth/student-set-password";
import WaitingApprovalPage from "@/pages/auth/waiting-approval";
import NotFoundPage from "@/pages/not-found";
import MyAwardsPage from "@/pages/user/awards";
import MyInternationalizationPage from "@/pages/user/internationalization";
import ProductionsPage from "@/pages/user/productions";
import ProfilePage from "@/pages/user/profile";
import ProjectsPage from "@/pages/user/projects";
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
      <Route path="student-set-password" element={<StudentSetPasswordPage />} />
      <Route
        path="student-registration-sent"
        element={<StudentRegistrationSentPage />}
      />
      <Route path="register" element={<RegisterPage />} />
      <Route path="waiting-approval" element={<WaitingApprovalPage />} />
      {/* Rotas Protegidas (Geral) */}
      <Route element={<EnsureAuthenticated />}>
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
              <Route element={<EnsureAdmin />}>
                <Route
                  path="student/productions"
                  element={<ProductionsPage mode="student" />}
                />
              </Route>
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="awards" element={<MyAwardsPage />} />
              <Route
                path="internationalization"
                element={<MyInternationalizationPage />}
              />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            {/* Rotas restritas apenas para ADMIN */}
            <Route path="admin" element={<EnsureAdmin />}>
              <Route index element={<Navigate to="/" replace />} />
              <Route path="areas" element={<AreasPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route
                path="student/requests"
                element={<StudentRequestsPage />}
              />
              <Route path="student/ranking" element={<StudentRankingPage />} />
              <Route path="student/rules" element={<StudentRulesPage />} />
              <Route path="awards" element={<AwardsPage />} />
              <Route
                path="internationalization"
                element={<InternationalizationAdminPage />}
              />
              <Route path="credenciamento" element={<CredenciamentoPage />} />
              <Route
                path="projects-dashboard"
                element={<ProjectDashboardPage />}
              />
              <Route path="professors" element={<ProfessorsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="orientacoes" element={<OrientacoesPage />} />
              <Route
                path="featured-productions"
                element={<FeaturedProductionsPage />}
              />
              <Route path="publishers" element={<PublishersPage />} />
              <Route path="qualis" element={<QualisPage />} />
              <Route path="rules" element={<RulesPage />} />
              <Route path="system-config" element={<SystemConfigPage />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route element={<EnsureManager />}>
                <Route path="lattes-uploads" element={<LattesUploadsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
