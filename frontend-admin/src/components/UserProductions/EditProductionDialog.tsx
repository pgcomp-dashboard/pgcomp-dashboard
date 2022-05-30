import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

interface EditProductionDialogProps {
  modalOpen: boolean,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EditProductionDialog({modalOpen, setModalOpen}: EditProductionDialogProps){
  return (
    <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>
          Editar Produção
        </DialogTitle>
      <DialogActions>
              <Button onClick={() => setModalOpen(false)}> Cancelar </Button>
              <Button onClick={() => setModalOpen(false)}>Salvar</Button>
          </DialogActions>
      </Dialog>
  )
}