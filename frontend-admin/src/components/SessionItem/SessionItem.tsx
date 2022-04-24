import styles from './SessionItem.module.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SessionItemProps {
    name: string,
    type: string
}

function SessionItem(props: SessionItemProps) {
    const iconsStyle = {
        height: '30px',
        width: '35px',
        cursor: 'pointer'
    }
    return (
        <div className={styles['SessionItem']}>
            <div>{props.name}</div>
            <div>
                <EditIcon style={iconsStyle} />
                <DeleteIcon style={iconsStyle} />
                <ExpandMoreIcon style={iconsStyle} />
            </div>
        </div>
    )
}

export default SessionItem;