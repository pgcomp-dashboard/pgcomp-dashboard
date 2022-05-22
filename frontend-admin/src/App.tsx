import React, { useState } from 'react';
import styles from './App.module.css';
import { Footer } from './components';
import Session from './components/Session/Session';
import SessionsPanel from './components/SessionsPanel/SessionsPanel';
import Toolbar from './components/Toolbar/Toolbar';
import { LoginPage } from './pages';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import DefaultPage from './pages/DefaultPage/DefaultPage';
import NewPasswordPage from "./pages/NewPassword/NewPassword";
import { AuthProvider } from './providers/AuthProvider';

function App() {
    
    return (
        <AuthProvider>
            <div className={styles.App}>
                <Toolbar />
                <DefaultPage />
                <Footer />
            </div>
        </AuthProvider>
    );

}

export default App;
