import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import { Footer } from './components';
import Session from './components/Session/Session';
import Toolbar from './components/Toolbar/Toolbar';
import UserProductions from './components/UserProductions/UserProductions';
import { LoginPage, RecoverPasswordPage } from './pages';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import DefaultPage from './pages/DefaultPage/DefaultPage';
import NewPasswordPage from "./pages/NewPassword/NewPassword";
import { AuthProvider } from './providers/AuthProvider';

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
                        <Route path="professors/:id/productions" element={<UserProductions />} />
                        <Route path="students/:id/productions" element={<UserProductions />} />
                        <Route path='students' element={<Session />} />
                        <Route index element={null} />
                    </Route>
                    <Route path="/login" element={<LoginPage/>} />
                </Routes>
                <Footer />
            </div>
        </AuthProvider>
    );

}

export default App;
