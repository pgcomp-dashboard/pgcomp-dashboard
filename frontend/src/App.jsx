import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Erro500 from './pages/Erro500';
import React from 'react';


export function App() {
    return (
        
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/erro" element={<Erro500/>} /> 
        </Routes>
            
    )
}

