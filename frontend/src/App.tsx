import { BrowserRouter, Routes, Route } from 'react-router';
import NotFoundPage from '@/pages/not-found';
import './App.css'

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route index element={<>Hello</>} />
              <Route path={"*"} element={<NotFoundPage />}/>
          </Routes>
      </BrowserRouter>
  )
}

export default App
