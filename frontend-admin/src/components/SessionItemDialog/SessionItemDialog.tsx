import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import React, { useState } from "react"

interface SessionItemDialogProps {
    open: boolean,
    type: string,
    handleClose: any
    name?: string,
    isEdit?: boolean
}

function SessionItemDialog(props: SessionItemDialogProps) {
    const [itemName, setItemName] = useState(props.name ? props.name : '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setItemName(newValue);
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>{props.isEdit ? 'Editar' : 'Adicionar'} {props.type.toLowerCase()}</DialogTitle>

            <DialogContent>

                <TextField id="itemName" label={'Insira ' + props.type.toLowerCase()} name="itemName" fullWidth
                    value={itemName}
                    onChange={handleInputChange} />

            </DialogContent>

            <DialogActions>
                <Button onClick={props.handleClose}> Cancelar </Button>
                <Button>Salvar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SessionItemDialog