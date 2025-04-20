import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router';
import NotFoundPage from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path={'*'} element={<NotFoundPage />}/>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
