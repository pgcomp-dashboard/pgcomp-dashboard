import { List } from '@mui/material';
import { useState } from 'react'
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css'
import Utils from '../../Utils'

interface SessionProps {
    type: string;
}

function Session(props: SessionProps) {
    const [modalOpened, setModalOpened] = useState(false);

    const handleModalOpen = () => {
        setModalOpened(true);
    }

    const handleModalClose = () => {
        setModalOpened(false);
    }

    const mockedChilds = [
        {name: 'child 1', type: 'qualis'},
        {name: 'child 2', type: 'qualis'},
    ]

    return (
        <div className={styles['Session']}>
            <AddSessionItemButton type={Utils.nameTypes[props.type]} handleOpen={handleModalOpen} />
            <List disablePadding>
                <SessionItem name='test' type='qualis' children={mockedChilds} />
            </List>

            <SessionItemDialog type={Utils.nameTypes[props.type]} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session