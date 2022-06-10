import { Dialog, DialogTitle, DialogActions, Button, DialogContent, Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { ProductionProps } from "./UserProductions";


interface JournalProps {
  name: string,
  id: number,
  last_qualis: string,
  stratum_qualis_id: number,
  publisher_type: string
}
interface EditProductionDialogProps {
  modalOpen: boolean,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  production: ProductionProps
}

export default function EditProductionDialog({modalOpen, setModalOpen, production}: EditProductionDialogProps){

  const [search, setSearch] = useState<string | undefined>()
  const [defaultValue, setDefault] = useState<JournalProps | undefined>()
  const [selectedValue, setSelectedValue] = useState<JournalProps | null>()
  const [options, setOptions] = useState<JournalProps[]>([])

  const groups = { "App\\Models\\Journal": "Journals", "App\\Models\\Conference": "Conferences"}

  const edit = () => {
    api.put(`/productions/${production.id}`, {
      publisher_id: selectedValue?.id,
      publisher_type: selectedValue?.publisher_type
    }).then(response => console.log(response))
  }

  useEffect(() => {
    api.get(`/journals/${production.publisher_id}`).then((response) => setDefault(response.data))
  }, [modalOpen])

  useEffect(() => {
    Promise.all([
      api.get(`/journals?filters[0][field]=name&filters[0][value]=${search}`).then(response => response.data.data.map((item: JournalProps) => ({...item, publisher_type: "App\\Models\\Journal" }))),
      api.get(`/conferences?filters[0][field]=name&filters[0][value]=${search}`).then(response => response.data.data.map((item: JournalProps) => ({...item, publisher_type: "App\\Models\\Conference"})))
    ]).then(response => setOptions([...response[0], ...response[1]]))
  }, [search])

  return (
    <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>
          Editar Produção
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            onChange={(e,v) => setSelectedValue(v)}
            defaultValue={defaultValue} 
            options={options}
            getOptionLabel={(option) => option.name}
            groupBy={option => groups[option.publisher_type as keyof typeof groups]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Journals" onChange={(e) => setSearch(e.target.value)} />}
          />
        </DialogContent>
      <DialogActions>
              <Button onClick={() => setModalOpen(false)}> Cancelar </Button>
              <Button onClick={(e) => {edit(); setModalOpen(false)}}>Salvar</Button>
          </DialogActions>
      </Dialog>
  )
}