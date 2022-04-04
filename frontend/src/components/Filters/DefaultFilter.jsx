import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

function DefaultFilter({ filter, setFilter }) {
    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Filtro</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filter}
                    label="Filtro"
                    onChange={(e) => { setFilter(e.target.value) }}
                >
                    <MenuItem value={10}>Geral</MenuItem>
                    <MenuItem value={20}>Lorem Ipsum</MenuItem>
                    <MenuItem value={30}>Ego sum</MenuItem>
                </Select>
            </FormControl>
        </>
    )
}

export default DefaultFilter