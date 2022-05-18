import { TextField } from '@mui/material';
import React from 'react';

function AreaForm(props: any) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        props.setItemName(newValue);
    }

    return <>
        <TextField id="itemName" label={'Insira o nome da área'} name="itemName" fullWidth
            value={props.itemName}
            onChange={handleInputChange}
            sx={{ marginTop: '15px' }}
        />
    </>
}

export default AreaForm