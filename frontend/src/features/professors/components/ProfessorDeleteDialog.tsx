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
import { Professor } from "@/types/user";

interface ProfessorDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professor: Professor | null;
  onConfirm: () => Promise<void>;
}

export function ProfessorDeleteDialog({
  isOpen,
  onOpenChange,
  professor,
  onConfirm,
}: ProfessorDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Professor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o professor <strong>{professor?.name}</strong>?
            Esta ação não pode ser desfeita.
            {professor && (
              <>
                <br />
                <span className="text-sm text-muted-foreground mt-1 block">
                  SIAPE: {professor.siape} • Categoria: {professor.category || 'Não informada'}
                </span>
              </>
            )}
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