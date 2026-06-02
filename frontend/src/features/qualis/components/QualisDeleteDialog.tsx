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
import { StratumQualis } from "@/types/academic";

interface QualisDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: StratumQualis | null;
  onConfirm: () => Promise<void>;
}

export function QualisDeleteDialog({
  isOpen,
  onOpenChange,
  item,
  onConfirm,
}: QualisDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Qualis</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o Qualis <strong>{item?.code}</strong> ({item?.type === 'journal' ? 'Periódico' : 'Conferência'})?
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
