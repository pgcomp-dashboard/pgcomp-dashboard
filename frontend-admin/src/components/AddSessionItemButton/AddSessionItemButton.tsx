import styles from './AddSessionItemButton.module.css'
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import React from 'react';

interface AddSessionItemProps {
    type: string,
    handleOpen: any,
    width?: string
}

function AddSessionItemButton(props: AddSessionItemProps) {
    return (
        <div className={styles['AddSessionItemButton']}>
            <Button variant="outlined" startIcon={<AddIcon />} sx={{ width: props.width ?? '100%' }} onClick={props.handleOpen}>
                Adicionar {props.type}
            </Button>
        </div>
    )
}

export default AddSessionItemButton