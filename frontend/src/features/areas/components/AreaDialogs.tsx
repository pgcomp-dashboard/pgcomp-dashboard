import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { Area } from "@/types/academic";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const areaFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type AreaFormValues = z.infer<typeof areaFormSchema>;

interface AreaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArea: Area | null;
  onSave: (name: string) => Promise<void>;
}

export function AreaFormDialog({
  open,
  onOpenChange,
  editingArea,
  onSave,
}: AreaFormDialogProps) {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useFormErrorToast(form.formState.errors);

  useEffect(() => {
    if (open) {
      form.reset({
        name: editingArea ? editingArea.name : "",
      });
    }
  }, [editingArea, open, form]);

  const handleSubmit = async (values: AreaFormValues) => {
    await onSave(values.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106">
        <DialogHeader>
          <DialogTitle>
            {editingArea ? "Editar Área" : "Adicionar Área"}
          </DialogTitle>
          <DialogDescription>
            {editingArea
              ? "Atualize o nome desta área de pesquisa."
              : "Insira o nome da nova área de pesquisa."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Área</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Engenharia de Software"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AreaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaToDelete: Area | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export function AreaDeleteDialog({
  open,
  onOpenChange,
  areaToDelete,
  isDeleting,
  onConfirm,
}: AreaDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Área</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a área{" "}
            <strong>{areaToDelete?.name}</strong>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
