import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { Loader2, Trash } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { projectFormSchema, ProjectFormValues } from '../types';
import { z } from 'zod';

interface ProjectDialogsProps {
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  onEditSubmit: (values: z.infer<typeof projectFormSchema>) => Promise<void>;
  editForm: UseFormReturn<ProjectFormValues>;
  onClearAll: () => Promise<void>;
}

export function ProjectDialogs({
  isEditOpen,
  setIsEditOpen,
  onEditSubmit,
  editForm,
  onClearAll,
}: ProjectDialogsProps) {
  useFormErrorToast(editForm.formState.errors);

  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>Atualize os dados do projeto.</DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do projeto</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="home_page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do projeto (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="start_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano de início</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="end_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano de fim (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="nature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Natureza</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="workload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carga horária semanal (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do projeto (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="funding_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fomento (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função no projeto</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full sm:w-auto" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ClearProjectsDialog({ onConfirm }: { onConfirm: () => Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash className="mr-1.5 h-4 w-4" /> Apagar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso vai permanentemente deletar todos os projetos.
          </AlertDialogDescription>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button className="bg-red-500 hover:bg-red-600" onClick={onConfirm}>
                Sim, deletar todos
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}