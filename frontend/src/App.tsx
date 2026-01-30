import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';

import useAuth from '@/hooks/auth';
import AdminLayout from '@/layouts/admin/admin-layout';
import AreasPage from '@/pages/admin/areas';
import CredenciamentoPage from '@/pages/admin/credenciamento';
import ProfessorsPage from '@/pages/admin/professors/professors-list';
import QualisPage from '@/pages/admin/qualis/index';
import StudentsPage from '@/pages/admin/students';
import SystemConfigPage from '@/pages/admin/system-config';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import LoginPage from '@/pages/auth/login';
import ResetPasswordPage from '@/pages/auth/reset-password';
import NotFoundPage from '@/pages/not-found';
import MyProductionsPage from '@/pages/user/my-productions';
import UserConfigPage from '@/pages/user/user-config';
import { AuthProvider } from '@/providers/AuthProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { LoadingSpinner } from './components/LoadingSpinner';
import AdminsPage from './pages/admin/admins';
import ProfessorProductionsPage from './pages/admin/professors/professor-production';
import WelcomePage from './pages/user/welcome';


const queryClient = new QueryClient();
const DashboardPage = lazy(() => import('./pages/admin/dashboard'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route index path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* Rotas Protegidas (Geral) */}
            <Route element={<EnsureAuthenticated />}>
              <Route element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route index path="/" element={<WelcomePage />} />
                <Route path='portal' >
                  <Route index element={<Navigate to='/' replace />} />
                  <Route path='credenciamento' element={<CredenciamentoPage />} />
                  <Route path='productions' element={<MyProductionsPage />} />
                  <Route path='user-config' element={<UserConfigPage />} />
                  <Route path='user-config' element={<UserConfigPage />} />
                </Route>

                {/* Rotas restritas apenas para ADMIN */}
                <Route path='admin' element={<EnsureAdmin />}>
                  <Route index element={<Navigate to='/' replace />} />
                  <Route path='team' element={<AdminsPage /> } />
                  <Route path='areas' element={<AreasPage />} />
                  <Route path='students' element={<StudentsPage />} />
                  <Route path='professors' element={<ProfessorsPage />} />
                  <Route path='professors/:productionId' element={<ProfessorProductionsPage />} />
                  <Route path='qualis' element={<QualisPage />} />
                  <Route path='system-config' element={<SystemConfigPage />} />
                  <Route path='system-config' element={<SystemConfigPage />} />
                  <Route path='productions' element={<MyProductionsPage />} />
                </Route>
              </Route>
              <Route path='admin' element={<EnsureAdmin />}>
                <Route
                  path='dashboard'
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
              </Route>
             </Route>
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
        <Toaster richColors position="top-right" />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function EnsureAuthenticated() {
  const auth = useAuth();

  if (auth?.isLoading) {
    return <>Carregando...</>;
  }

  if (auth?.isAuthenticated) {
    return <Outlet />;
  } else {
    console.error('User not authenticated. Redirecting back to login page...');
    return <Navigate to='/login' replace />;
  }
}

function EnsureAdmin() {
  const auth = useAuth();

  if (auth?.isLoading) return <Loader2 />;

  return auth?.isAdmin
    ? <Outlet />
    : <Navigate to="/" replace />;

}

export default App;
