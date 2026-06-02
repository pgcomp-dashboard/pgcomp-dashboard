import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Publisher } from "@/types/academic";

interface PublisherDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  publisher: Publisher | null;
  onConfirm: () => Promise<void>;
}

export function PublisherDeleteDialog({
  isOpen,
  onOpenChange,
  publisher,
  onConfirm,
}: PublisherDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o veículo <strong>{publisher?.name}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
