import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import React, { useState } from "react"
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { createItem, updateItem } from '../../services/ItemsService';
import AreaForm from "../../forms/AreaForm";

interface SessionItemDialogProps {
    open: boolean,
    type: string,
    typeAttr: string,
    handleClose: any,
    program_id?: any,
    save?: any,
    id?: number,
    name?: string,
    isEdit?: boolean,
}

const SessionItemDialog = (props: any) => {
    const [itemName, setItemName] = useState(props.name ? props.name : '');

    const { token } = useContext(AuthContext);

    const forms: any = {
        'areas': <AreaForm itemName={itemName} setItemName={setItemName} />
    }

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const save = () => {
        if (props.isEdit) {
            updateItem(config, props.typeAttr, {name: itemName, id: props.id});
        } else {
            createItem(config, props.typeAttr, {name: itemName});
        }
    }


    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>{props.isEdit ? 'Editar' : 'Adicionar'} {props.type.toLowerCase()}</DialogTitle>

            <DialogContent>

                {forms[props.typeAttr]}

            </DialogContent>

            <DialogActions>
                <Button onClick={props.handleClose}> Cancelar </Button>
                <Button onClick={() => { save(); props.handleClose(); }}>Salvar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SessionItemDialog