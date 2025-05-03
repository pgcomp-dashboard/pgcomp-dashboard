import { TextField } from '@mui/material';
import React from 'react';

export function AreaForm(props: any) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    props.setFormFields({ area_name: newValue, program_id: 1 });
  };

  return <>
    <TextField id="itemName" label={'Insira o nome da área'} name="itemName" fullWidth
      defaultValue={props.areaName}
      onChange={handleInputChange}
      sx={{ marginTop: '15px' }}
    />
  </>;
}