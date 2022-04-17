import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

function DefaultFilter({ filter, setFilter, options }) {
    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Filtro</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filter}
                    label="Filtro"
                    onChange={(e) => { setFilter(e.target.value) }}>
                    <MenuItem value={10}>Geral</MenuItem>
                    {options ? options.map(option => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)) : null}
                </Select>
            </FormControl>
        </>
    )
}

export default DefaultFilter