import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import { Footer } from './components';
import PersonInfo from './components/PersonInfo/PersonInfo';
import Session from './components/Session/Session';
import Toolbar from './components/Toolbar/Toolbar';
import UserProductions from './components/UserProductions/UserProductions';
import { LoginPage, RecoverPasswordPage } from './pages';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import DefaultPage from './pages/DefaultPage/DefaultPage';
import NewPasswordPage from "./pages/NewPassword/NewPassword";
import { AuthProvider } from './providers/AuthProvider';
import NotFound from './pages/NotFound';
import Erro500 from './pages/Erro500';
function App() {
    
    return (
        <AuthProvider>
            <div className={styles.App}>
                <Toolbar />
                <Routes>
                    <Route element={<DefaultPage />}>
                        <Route path='areas' element={<Session />} />
                        <Route path='qualis' element={<Session />} />
                        <Route path='professors' element={<Session />} />
                        <Route path='professors/:id' element={<PersonInfo />} /> 
                        <Route path="professors/:id/productions" element={<UserProductions />} />
                        <Route path='students' element={<Session />} />
                        <Route path='students/:id' element={<PersonInfo />} /> 
                        <Route path="students/:id/productions" element={<UserProductions />} />
                        <Route index element={null} />
                    </Route>
                    <Route path="/login" element={<LoginPage/>} />
                    <Route path="*" element={<NotFound/>} />
                    <Route path="/erro" element={<Erro500/>} />
                </Routes>
                <Footer />
            </div>
        </AuthProvider>
    );

}

export default App;
