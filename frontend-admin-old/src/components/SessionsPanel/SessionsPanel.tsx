import styles from './SessionsPanel.module.css'
import PieChartOutlinedIcon from '@mui/icons-material/PieChartOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SessionItem from '../SessionPanel/SessionPanel';
import React from 'react';
import { useMatch } from 'react-router-dom';

// interface SessionsPanelProps {
//     setSelectedSession: any,
//     selectedSession: string
// }

function SessionsPanel() {

    const iconStyle = {
        'height': '58px',
        'width': '58px'
    }

    const match = useMatch(":sessionType/*")
    const sessionType = match?.params.sessionType

    return (
        <div className={styles['SessionsPanel']}>
            <ul>
                <SessionItem icon={<PieChartOutlinedIcon style={iconStyle} />} label={'Áreas e sub-áreas'} 
                    session='areas' isSelected={'areas' == sessionType} />
                <SessionItem icon={<BarChartOutlinedIcon style={iconStyle} />} label={'Qualis'} 
                    session='qualis' isSelected={'qualis' == sessionType} />
                <SessionItem icon={<BadgeOutlinedIcon style={iconStyle} />} label={'Docentes'} 
                    session='professors' isSelected={'professors' == sessionType} />
                <SessionItem icon={<SchoolOutlinedIcon style={iconStyle} />} label={'Discentes'} 
                    session='students' isSelected={'students' == sessionType} />
            </ul>
        </div>
    )
}

export default SessionsPanel