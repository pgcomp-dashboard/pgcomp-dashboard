import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField } from "@mui/material"
import React, { useState } from "react"
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { deleteItem } from '../../services/ItemsService';

interface DeleteItemDialogProps {
    open: boolean,
    type: string,
    typeAttr: string,
    handleClose: any,
    id: number
}

function DeleteItemDialog(props: DeleteItemDialogProps) {
    const { token, change, setChange } = useContext(AuthContext);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    };

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const deleteFn = async () => {
        try {
            const response = await deleteItem(config, props.typeAttr, props.id);
            if (!response?.success) {
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);
                return;
            }

            setChange(change + 1);
        } catch (e: any) {
            console.log(e);
        }
    }

    return (
        <>
            <Dialog open={props.open} onClose={props.handleClose}>
                <DialogTitle>Deseja excluir o item?</DialogTitle>
                <DialogActions>
                    <Button onClick={props.handleClose}> Cancelar </Button>
                    <Button onClick={() => { deleteFn(); props.handleClose(); }}>Confirmar</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpen}
                autoHideDuration={6000}
                onClose={closeSnackbar}>
                <Alert severity="error" onClose={closeSnackbar} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>
        </>
    )
}

export default DeleteItemDialog