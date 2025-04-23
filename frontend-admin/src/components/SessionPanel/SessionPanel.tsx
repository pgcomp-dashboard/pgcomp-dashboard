import styles from './SessionPanel.module.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionPanelProps {
    label: string;
    icon: any,
    session: string,
    // setSelectedSession: any,
    isSelected: boolean
}

function SessionPanel({ label, icon, session, isSelected }: SessionPanelProps) {
    const style = isSelected ? { color: 'yellow', marginLeft: '7px' } : { marginLeft: '7px', color: 'white' };
    const navigate = useNavigate()
    return (
        <li onClick={() => navigate(session, {replace: false})} className={styles['SessionPanel']}>
            {icon}

            <span style={style}>
                {label}
            </span>
        </li>
    )
}

export default SessionPanel