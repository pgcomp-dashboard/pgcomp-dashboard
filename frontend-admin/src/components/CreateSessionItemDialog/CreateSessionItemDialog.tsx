import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import React, { useState } from "react"

interface CreateSessionItemDialogProps {
    open: boolean,
    type: string,
    handleClose: any
}

function CreateSessionItemDialog(props: CreateSessionItemDialogProps) {
    const [itemName, setItemName] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setItemName(newValue);
    }

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>Criar {props.type.toLowerCase()}</DialogTitle>

            <DialogContent>

                <TextField id="itemName" label={'Adicionar ' + props.type.toLowerCase()} name="itemName" fullWidth
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

export default CreateSessionItemDialog