import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from 'react-router';

import useAuth from '@/hooks/auth';
import LoginPage from '@/pages/login';
import { AuthProvider } from '@/providers/AuthProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import AdminLayout from './layouts/admin/admin-layout';
import AreasPage from './pages/admin/areas';
import MyProductionsPage from './pages/admin/my-productions';
import ProfessorsPage from './pages/admin/professors';
import QualisPage from './pages/admin/qualis/index';
import RankingPage from './pages/admin/ranking';
import RankingFourPage from './pages/admin/ranking-four';
import StudentsPage from './pages/admin/students';
import SystemConfigPage from './pages/admin/system-config';
import UserConfigPage from './pages/admin/user-config';
import DashboardPage from './pages/dashboard';
import ForgotPasswordPage from './pages/login/forgot-password';
import NotFoundPage from './pages/not-found';
import ResetPasswordPage from './pages/reset-password';
import WelcomePage from './pages/admin/welcome';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/'>
              <Route index element={<DashboardPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route element={<AdminLayout><EnsureAuthenticated /></AdminLayout>}>
                <Route path='welcome' element={<WelcomePage /> } />
                <Route path='portal'>
                  <Route index element={<Redirect to='/welcome' />} />
                  <Route path='ranking' element={<RankingPage />} />
                  <Route path='ranking-four' element={<RankingFourPage />} />

                  <Route path='productions' element={<MyProductionsPage />} />
                </Route>
                <Route path='admin'>
                  <Route index element={<Redirect to='/welcome' />} />
                  <Route path='areas' element={<AreasPage />} />
                  <Route path='students' element={<StudentsPage />} />
                  <Route path='professors' element={<ProfessorsPage />} />
                  <Route path='qualis' element={<QualisPage />} />
                  <Route path='user-config' element={<UserConfigPage />} />
                  <Route path='system-config' element={<SystemConfigPage />}/>
                  <Route path='productions' element={<MyProductionsPage />} />
                </Route>
              </Route>
              <Route path='*' element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right"/>
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
    return <Redirect to='/login' />;
  }
}

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [ navigate, to ]);
  return <></>;
}

export default App;
