import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useSearchParams } from 'react-router';
import { ChangeEvent, FormEvent, useState } from 'react';



export default function SearchInput(){

  const [ , setSearchParams ] = useSearchParams();
  const [ search, setSearch ] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    search ? setSearchParams({ name: search }) : setSearchParams({});
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row-reverse' }}>
      <TextField
        size="small"
        placeholder='Pesquisar docente...'
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon/>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
