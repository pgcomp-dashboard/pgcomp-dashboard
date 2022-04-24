import { List } from '@mui/material';
import { useState } from 'react'
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import CreateSessionItemDialog from '../CreateSessionItemDialog/CreateSessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css'

interface nameTypesLayout {
    [key: string]: string
}

interface SessionProps {
    type: string;
}

const nameTypes: nameTypesLayout = {
    areas: 'Área de estudo',
    qualis: 'Nota qualis',
    teachers: 'Docente',
    students: 'Discente'
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
            <AddSessionItemButton type={nameTypes[props.type]} handleOpen={handleModalOpen} />
            <List disablePadding>
                <SessionItem name='test' type='qualis' children={mockedChilds} />
            </List>

            <CreateSessionItemDialog type={nameTypes[props.type]} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session