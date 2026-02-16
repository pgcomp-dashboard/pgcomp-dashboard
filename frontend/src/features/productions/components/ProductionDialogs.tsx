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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Publisher } from '@/types/academic';
import { Loader2, Search, Trash } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { updateProductionFormSchema } from '../types';

interface ProductionDialogsProps {
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  onEditSubmit: (values: z.infer<typeof updateProductionFormSchema>) => Promise<void>;
  editForm: UseFormReturn<z.infer<typeof updateProductionFormSchema>>;
  editState: {
    publisher: Publisher | null;
    type: string;
    search: string;
    isSearching: boolean;
    results: Publisher[];
    showResults: boolean;
    setShowResults: (show: boolean) => void;
    handleInput: (e: any) => void;
    handleTypeChange: (value: string) => void;
    handleSelect: (p: Publisher) => void;
  };
  onClearAll: () => Promise<void>;
}

export function ProductionDialogs({
  isEditOpen,
  setIsEditOpen,
  onEditSubmit,
  editForm,
  editState,
}: ProductionDialogsProps) {
  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produção</DialogTitle>
            <DialogDescription>Atualize os dados da sua produção.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Tipo de publicação</Label>
              <RadioGroup
                className="flex gap-4"
                value={editState.type}
                onValueChange={editState.handleTypeChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conference" id="edit-conference" />
                  <Label htmlFor="edit-conference" className="font-normal cursor-pointer">
                    Conferência
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="journal" id="edit-journal" />
                  <Label htmlFor="edit-journal" className="font-normal cursor-pointer">
                    Revista
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da produção</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="doi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOI (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg relative">
                  <Label className="text-sm">
                    Buscar {editState.type === 'journal' ? 'Periódico' : 'Conferência'}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                      {editState.isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </div>
                    <Input
                      placeholder={
                        editState.type === 'journal'
                          ? 'Buscar por nome ou ISSN...'
                          : 'Buscar por nome ou sigla...'
                      }
                      type="text"
                      value={editState.search}
                      onChange={editState.handleInput}
                      className="pl-9 h-10"
                    />

                    {editState.showResults && editState.results.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                        {editState.results.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 transition-colors"
                            onClick={() => editState.handleSelect(p)}
                          >
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>
                                {p.publisher_type === 'journal'
                                  ? `ISSN: ${p.issn || 'N/A'}`
                                  : `Sigla: ${p.initials || 'N/A'}`}
                              </span>
                              <span className="font-semibold text-primary">
                                Qualis: {p.stratum_qualis?.code || 'N/A'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {editState.publisher && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">{editState.publisher.name}</p>
                          <p className="text-xs text-green-700">
                            {editState.publisher.publisher_type === 'journal'
                              ? `ISSN: ${editState.publisher.issn || 'N/A'}`
                              : `Sigla: ${editState.publisher.initials || 'N/A'}`}
                          </p>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">
                          Qualis: {editState.publisher.stratum_qualis?.code || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="w-full sm:w-auto" disabled={editForm.formState.isSubmitting}>
                    {editForm.formState.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ClearProductionsDialog({ onConfirm }: { onConfirm: () => Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash className="mr-1.5 h-4 w-4" /> Limpar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso vai permanentemente deletar todas as produções.
          </AlertDialogDescription>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button className="bg-red-500 hover:bg-red-600" onClick={onConfirm}>
                Sim, deletar todas
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
