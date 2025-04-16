import { useState } from 'react'
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Erro500 from './pages/Erro500';
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/erro" element={<Erro500/>} /> 
    </Routes>
  )
}

export default App
