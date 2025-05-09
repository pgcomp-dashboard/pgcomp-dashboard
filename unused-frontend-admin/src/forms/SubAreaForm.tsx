import { TextField } from '@mui/material';
import React from 'react';

export function SubAreaForm(props: any) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    props.setFormFields({ subarea_name: newValue, area_id: props.areaId });
  };

  return <>
    <TextField id="itemName" label={'Insira o nome da sub-área'} name="itemName" fullWidth
      defaultValue={props.subAreaName}
      onChange={handleInputChange}
      sx={{ marginTop: '15px' }}
    />
  </>;
}