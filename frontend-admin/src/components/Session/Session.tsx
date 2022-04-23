import { useState } from 'react'
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import CreateSessionItemDialog from '../CreateSessionItemDialog/CreateSessionItemDialog';
import styles from './Session.module.css'

interface nameTypesLayout {
    [key: string]: string
}

interface SessionProps {
    type: string;
}

const nameTypes: nameTypesLayout = {
    areas: 'Áreas de estudo',
    qualis: 'Notas qualis',
    teachers: 'Docentes',
    students: 'Discentes'
}

function Session(props: SessionProps) {
    const [modalOpened, setModalOpened] = useState(false);

    const handleModalOpen = () => {
        setModalOpened(true);
    }

    const handleModalClose = () => {
        setModalOpened(false);
    }

    return (
        <div className={styles['Session']}>
            <AddSessionItemButton type={nameTypes[props.type]} handleOpen={handleModalOpen} />
            <CreateSessionItemDialog type={nameTypes[props.type]} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session