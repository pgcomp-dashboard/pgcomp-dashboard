import styles from './SessionItem.module.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse, ListItem } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

interface SessionItemProps {
    name: string,
    type: string
    children?: any,
    isChildren?: boolean
}

function SessionItem(props: SessionItemProps) {
    const iconsStyle = {
        height: '30px',
        width: '35px',
        cursor: 'pointer'
    }

    const [expandChildren, setExpandChildren] = useState(false);

    const childrenStyle = props.isChildren ? { marginLeft: '15px' } : {};
    return (
        <>
            <ListItem disablePadding style={childrenStyle}>
                <div className={styles['SessionItem']}>
                    <div>{props.name}</div>
                    <div>
                        <EditIcon style={iconsStyle} />
                        <DeleteIcon style={iconsStyle} />
                        {expandChildren ? <ExpandLessIcon style={iconsStyle} onClick={() => setExpandChildren(!expandChildren)} /> :
                            <ExpandMoreIcon style={iconsStyle} onClick={() => setExpandChildren(!expandChildren)} />}
                    </div>
                </div>
            </ListItem>
            <Collapse in={expandChildren} timeout="auto" unmountOnExit>
                {props.children ? props.children.map((item: SessionItemProps) => {
                    return <SessionItem name={item.name} type={item.type} isChildren={true} />
                }) : null}
            </Collapse>
        </>
    )
}

export default SessionItem;