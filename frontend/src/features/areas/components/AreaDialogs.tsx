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
import { Button } from "@/components/ui/button";
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
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Area } from "@/types/academic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const areaFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type AreaFormValues = z.infer<typeof areaFormSchema>;

interface AreaDialogsProps {
  isAddEditOpen: boolean;
  onAddEditOpenChange: (open: boolean) => void;
  isDeleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  editingArea: Area | null;
  areaToDelete: Area | null;
  onSave: (name: string) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
}

export function AreaDialogs({
  isAddEditOpen,
  onAddEditOpenChange,
  isDeleteOpen,
  onDeleteOpenChange,
  editingArea,
  areaToDelete,
  onSave,
  onConfirmDelete,
}: AreaDialogsProps) {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isAddEditOpen) {
      form.reset({
        name: editingArea ? editingArea.name : "",
      });
    }
  }, [editingArea, isAddEditOpen, form]);

  const handleSubmit = async (values: AreaFormValues) => {
    await onSave(values.name);
    onAddEditOpenChange(false);
  };

  return (
    <>
      <Dialog open={isAddEditOpen} onOpenChange={onAddEditOpenChange}>
        <DialogContent className="sm:max-w-106">
          <DialogHeader>
            <DialogTitle>{editingArea ? "Editar Área" : "Adicionar Área"}</DialogTitle>
            <DialogDescription>
              {editingArea
                ? "Atualize o nome desta área de pesquisa."
                : "Insira o nome da nova área de pesquisa."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Área</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Engenharia de Software" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => onAddEditOpenChange(false)}>
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

      <AlertDialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Área</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a área <strong>{areaToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
