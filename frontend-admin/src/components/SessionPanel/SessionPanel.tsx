import styles from './SessionPanel.module.css';
import React from 'react';

interface SessionPanelProps {
    label: string;
    icon: any,
    session: string,
    setSelectedSession: any,
    isSelected: boolean
}

function SessionPanel({ label, icon, session, setSelectedSession, isSelected }: SessionPanelProps) {
    const style = isSelected ? { color: 'yellow', marginLeft: '7px' } : { marginLeft: '7px' };
    return (
        <li onClick={() => setSelectedSession(session)} className={styles['SessionPanel']}>
            {icon}

            <span style={style}>
                {label}
            </span>
        </li>
    )
}

export default SessionPanel