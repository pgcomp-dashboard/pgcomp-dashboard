import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
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
    const { token } = useContext(AuthContext);

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const deleteFn = () => {
        deleteItem(config, props.typeAttr, props.id);
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>Deseja excluir o item?</DialogTitle>
            <DialogActions>
                <Button onClick={props.handleClose}> Cancelar </Button>
                <Button onClick={() => { deleteFn(); props.handleClose(); }}>Confirmar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteItemDialog