import styles from './AddSessionItemButton.module.css'
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

interface AddSessionItemProps {
    type: string
}

function AddSessionItemButton(props: AddSessionItemProps) {
    return (
        <div className={styles['AddSessionItemButton']}>
            <Button variant="outlined" startIcon={<AddIcon />} sx={{ width: '100%' }}>
                Adicionar {props.type.toLowerCase()}
            </Button>
        </div>
    )
}

export default AddSessionItemButton