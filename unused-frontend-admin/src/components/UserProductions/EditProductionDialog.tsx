import { Dialog, DialogTitle, DialogActions, Button, DialogContent, Autocomplete, TextField, Snackbar, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { api } from '../../services/api';


interface PublisherProps {
  name?: string,
  id?: number,
  publisher_type?: string
}
interface EditProductionDialogProps {
  modalOpen: boolean,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  productionId?: number
  publisher: PublisherProps
}

interface SnackbarProps {
  success: boolean,
  message: string
}

export default function EditProductionDialog({ modalOpen, setModalOpen, publisher, productionId }: EditProductionDialogProps){

  const [ search, setSearch ] = useState<string | undefined>();
  const [ selectedValue, setSelectedValue ] = useState<PublisherProps | null>(publisher);
  const [ options, setOptions ] = useState<PublisherProps[]>([]);
  const [ snackbarOpen, setSnackbar ] = useState<boolean>(false);
  const [ snackbarContents, setSnackContents ] = useState<SnackbarProps>({ success: false, message: 'Houve um erro na edição' });
  const navigate = useNavigate();
  const location = useLocation();

  const groups = { 'App\\Models\\Journal': 'Journals', 'App\\Models\\Conference': 'Conferences' };

  const edit = () => {
    api.put(`/productions/${productionId}`, {
      publisher_id: selectedValue?.id || null,
      publisher_type: selectedValue?.publisher_type,
    }).then(() => {
      setSnackbar(true);
      setSnackContents({ success: true, message: 'Publicação editada com sucesso.' });
    }).then(() => navigate(location.pathname+location.search)).catch(() => {
      setSnackbar(true);
    });
  };

  useEffect(() => {
    Promise.all([
      api.get(`/journals?filters[0][field]=name&filters[0][value]=${search}`).then(response => response.data.data.map((item: PublisherProps) => ({ name: item.name, id: item.id, publisher_type: 'App\\Models\\Journal' }))),
      api.get(`/conferences?filters[0][field]=name&filters[0][value]=${search}`).then(response => response.data.data.map((item: PublisherProps) => ({ name: item.name, id: item.id, publisher_type: 'App\\Models\\Conference' }))),
    ]).then(response => setOptions([ ...response[0], ...response[1] ]));
  }, [ search ]);

  return (
    <>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>
          Editar Produção
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            onChange={(_,v) => setSelectedValue(v)}
            defaultValue={publisher}
            options={options}
            getOptionLabel={(option) => option.name!}
            groupBy={option => groups[option.publisher_type as keyof typeof groups]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Pesquisar publicações..." onChange={(e) => setSearch(e.target.value)} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}> Cancelar </Button>
          <Button onClick={(_) => {
            edit(); setModalOpen(false);
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbarContents.success ? 'success' : 'error'}>
          {snackbarContents.message}
        </Alert>
      </Snackbar>
    </>

  );
}
