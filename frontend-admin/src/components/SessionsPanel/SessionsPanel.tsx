import styles from './SessionsPanel.module.css'
import PieChartOutlinedIcon from '@mui/icons-material/PieChartOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SessionItem from '../SessionPanel/SessionPanel';
import React from 'react';

interface SessionsPanelProps {
    setSelectedSession: any,
    selectedSession: string
}

function SessionsPanel({ setSelectedSession, selectedSession }: SessionsPanelProps) {

    const iconStyle = {
        'height': '42px',
        'width': '42px'
    }

    return (
        <div className={styles['SessionsPanel']}>
            <ul>
                <SessionItem icon={<PieChartOutlinedIcon style={iconStyle} />} label={'Áreas e sub-áreas'} setSelectedSession={setSelectedSession}
                    session='areas' isSelected={'areas' == selectedSession} />
                <SessionItem icon={<BarChartOutlinedIcon style={iconStyle} />} label={'Qualis'} setSelectedSession={setSelectedSession}
                    session='qualis' isSelected={'qualis' == selectedSession} />
                <SessionItem icon={<BadgeOutlinedIcon style={iconStyle} />} label={'Docente'} setSelectedSession={setSelectedSession}
                    session='professors' isSelected={'professors' == selectedSession} />
                <SessionItem icon={<SchoolOutlinedIcon style={iconStyle} />} label={'Discente'} setSelectedSession={setSelectedSession}
                    session='students' isSelected={'students' == selectedSession} />
            </ul>
        </div>
    )
}

export default SessionsPanel