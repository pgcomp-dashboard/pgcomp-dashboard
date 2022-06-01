import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import React, { useState } from "react"
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { createItem, updateItem } from '../../services/ItemsService';
import { AreaForm, QualisForm } from "../../forms"
import { SubAreaForm } from "../../forms/SubAreaForm";

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
    const [formFields, setFormFields] = useState({});

    const { token, change, setChange } = useContext(AuthContext);
    const forms: any = {
        'areas': <AreaForm areaName={props.area_name} setFormFields={setFormFields} />,
        'subareas': <SubAreaForm subAreaName={props.subarea_name} areaId={props.areaId} id={props.id} setFormFields={setFormFields} />,
        'qualis': <QualisForm score={props.score} setFormFields={setFormFields} />
    }

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const save = () => {
        console.log(formFields);
        if (props.isEdit) {
            updateItem({ fields: formFields, type: props.typeAttr, id: props.id })
        } else {
            createItem(config, props.typeAttr, formFields);
        }

        setChange(change + 1);
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