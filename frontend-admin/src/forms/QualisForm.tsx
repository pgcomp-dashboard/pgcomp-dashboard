import { TextField } from '@mui/material';
import React, { useState } from 'react';

export function QualisForm(props: any) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    props.setFormFields((prevState: object) => ({ ...prevState, score: newValue }));
  };

  return <>

    <TextField id="qualis-score" label={'Insira a nota qualis'} name="itemName" fullWidth
      defaultValue={props.score}
      onChange={handleInputChange}
      sx={{ marginTop: '15px' }}
      type="text"
    />
  </>;
}