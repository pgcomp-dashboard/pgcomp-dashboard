import { BrowserRouter, Routes, Route, useNavigate, Outlet } from 'react-router';
import { useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import useAuth from '@/hooks/auth';
import { AuthProvider } from '@/providers/AuthProvider';
import LoginPage from '@/pages/Login';
import AdminLayout from './layouts/admin/admin-layout';
import AreasPage from './pages/Areas';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/'>
              <Route index element={<Redirect to="/admin/areas" />}/>
              <Route path="login" element={<LoginPage/>}/>
              <Route path='admin' element={<AdminLayout><EnsureAuthenticated /></AdminLayout>}>
                <Route index element={<Redirect to='/admin/areas' />}/>
                <Route path='areas' element={<AreasPage />}/>
                {/* <Route path='qualis' element={<Session/>}/> */}
                {/* <Route path='professors' element={<ProfessorPanel />} /> */}
                {/* <Route path='professors/:id' element={<PersonInfo/>}/> */}
                {/* <Route path="professors/:id/productions" element={<UserProductions/>}/> */}
                {/* <Route path="professors/:id/xml-upload" element={<XmlUpload/>}/> */}
                {/* <Route path='students' element={<Session/>}/> */}
                {/* <Route path='students/:id' element={<PersonInfo/>}/> */}
                {/* <Route path="students/:id/productions" element={<UserProductions/>}/> */}
                {/* <Route path="students/:id/xml-upload" element={<XmlUpload/>}/> */}
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function EnsureAuthenticated() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <>Carregando...</>;
  }

  if (auth.isAuthenticated) {
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
