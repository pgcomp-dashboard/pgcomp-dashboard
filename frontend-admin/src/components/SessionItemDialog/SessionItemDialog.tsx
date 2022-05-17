import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import React, { useState } from "react"
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';

interface SessionItemDialogProps {
    open: boolean,
    type: string,
    typeAttr: string,
    handleClose: any,
    program_id?: any,
    save?: any,
    name?: string,
    isEdit?: boolean,
}

function SessionItemDialog(props: SessionItemDialogProps) {
    const [itemName, setItemName] = useState(props.name ? props.name : '');
    const { token, change, setChange } = useContext(AuthContext);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setItemName(newValue);
    }

    const config: any = {
        headers: {
            'Authorization': token
        }
    }

    const save: any = {
        'areas': (area_name: string) => {
            config.method = props.isEdit ? 'put' : 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/areas';
            config.data = { area_name, program_id: props.isEdit ? props.program_id : 1 }
            axios(config);
            setChange(change + 1);
        }
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>{props.isEdit ? 'Editar' : 'Adicionar'} {props.type.toLowerCase()}</DialogTitle>

            <DialogContent>

                <TextField id="itemName" label={'Insira ' + props.type.toLowerCase()} name="itemName" fullWidth
                    value={itemName}
                    onChange={handleInputChange}
                    sx={{ marginTop: '15px' }}
                />

            </DialogContent>

            <DialogActions>
                <Button onClick={props.handleClose}> Cancelar </Button>
                <Button onClick={() => { save[props.typeAttr](itemName); props.handleClose(); }}>Salvar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SessionItemDialog