import React, { useState } from 'react';
import styles from './App.module.css';
import Session from './components/Session/Session';
import SessionsPanel from './components/SessionsPanel/SessionsPanel';
import Toolbar from './components/Toolbar/Toolbar';

function App() {
    const [selectedSession, setSelectedSession] = useState('areas');

    return (
        <div className={styles.App}>
            <Toolbar />
            <div className={styles['admin__panel']}>
                <h1> Painel de administração </h1>

                <div className={styles['admin__panel__board']}>
                    <SessionsPanel setSelectedSession={setSelectedSession} />
                    <Session type={selectedSession} />
                </div>

            </div>
        </div>
    );
}

export default App;
