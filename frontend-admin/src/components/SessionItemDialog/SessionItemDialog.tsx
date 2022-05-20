import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import React, { useState } from "react"
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { createItem, updateItem, updateItemRefactor } from '../../services/ItemsService';
import {AreaForm, QualisForm} from "../../forms"

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
    const [itemName, setItemName] = useState(props.fields);
    const [formFields, setFormFields] = useState({});

    const { token } = useContext(AuthContext);

    const forms: any = {
        'areas': <AreaForm areaName={props.area_name} setFormFields={setFormFields} />,
        'qualis': <QualisForm score={props.score} setFormFields={setFormFields} />
    }

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const save = () => {
        if (props.isEdit) {
            // updateItem(config, props.typeAttr, {name: itemName, id: props.id});
            updateItemRefactor({fields: formFields, type: props.typeAttr, id: props.id})
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