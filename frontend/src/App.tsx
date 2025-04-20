import { BrowserRouter, Routes, Route } from 'react-router';
import NotFoundPage from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path={'*'} element={<NotFoundPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
