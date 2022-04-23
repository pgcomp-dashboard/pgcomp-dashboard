import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
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

function Session(props: SessionProps){
    return (
        <div className={styles['Session']}>
            <AddSessionItemButton type={nameTypes[props.type]} />
        </div>
    )
}

export default Session