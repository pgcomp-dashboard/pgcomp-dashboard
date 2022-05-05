import { useState } from "react";
import Session from "../../components/Session/Session"
import SessionsPanel from "../../components/SessionsPanel/SessionsPanel"
import styles from '../../App.module.css';


function AdminPanel() {
    const [selectedSession, setSelectedSession] = useState('areas');
    return (
        <div className={styles['admin__panel']}>
            <h1> Painel de administração </h1>
            <div className={styles['admin__panel__board']}>
                <SessionsPanel setSelectedSession={setSelectedSession} selectedSession={selectedSession} />
                <Session type={selectedSession} />
            </div>
        </div>
    )
}

export default AdminPanel