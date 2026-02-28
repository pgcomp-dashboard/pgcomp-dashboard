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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { Publisher } from '@/types/academic';
import { Loader2, Plus, Search, Trash, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
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
    isCreatingNew: boolean;
    setIsCreatingNew: (show: boolean) => void;
    isSubmittingNew: boolean;
    qualisOptions: any[];
    newPublisherData: { name: string; code: string; stratum_qualis_id?: number };
    setNewPublisherData: (data: any) => void;
    handleCreateNew: () => Promise<Publisher>;
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
  useFormErrorToast(editForm.formState.errors);

  const filteredQualis = useMemo(() => {
    return editState.qualisOptions.filter((q: any) => q.type === editState.type);
  }, [editState.qualisOptions, editState.type]);

  // Sync newPublisherData.name with search input when starting to create
  useEffect(() => {
    if (editState.isCreatingNew && !editState.newPublisherData.name) {
      editState.setNewPublisherData((prev: any) => ({ ...prev, name: editState.search }));
    }
  }, [editState.isCreatingNew, editState.search]);

  async function handleCreateNewPublisher() {
    try {
      await editState.handleCreateNew();
      toast.success('Veículo criado com sucesso (pendente de aprovação)');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar veículo');
      console.error(err);
    }
  }

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
                    Periódico
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

                    {editState.showResults && !editState.isSearching && editState.results.length > 0 && (
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
                                  ? `ISSN: ${p.issns?.join(", ") || 'N/A'}`
                                  : `Sigla: ${p.initials || 'N/A'}`}
                              </span>
                              <span className="font-semibold text-primary">
                                Qualis: {p.stratum_qualis?.code || 'N/A'}
                              </span>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-primary font-medium flex items-center transition-colors border-t"
                          onClick={() => {
                            editState.setIsCreatingNew(true);
                            editState.setShowResults(false);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Não encontrou? Criar novo
                        </button>
                      </div>
                    )}

                    {editState.showResults && !editState.isSearching && editState.results.length === 0 && editState.search.length >= 2 && !editState.isCreatingNew && (
                      <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Nenhum veículo encontrado</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editState.setIsCreatingNew(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar novo {editState.type === 'journal' ? 'Periódico' : 'Conferência'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {editState.isCreatingNew && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-3 animate-in fade-in slide-in-from-top-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-primary">Novo {editState.type === 'journal' ? 'Periódico' : 'Conferência'}</h4>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => editState.setIsCreatingNew(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Nome</Label>
                        <Input
                          placeholder="Nome completo"
                          className="h-8 text-sm"
                          value={editState.newPublisherData.name}
                          onChange={(e) => editState.setNewPublisherData({ ...editState.newPublisherData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{editState.type === 'journal' ? 'ISSN' : 'Sigla (Opcional)'}</Label>
                        <Input
                          placeholder={editState.type === 'journal' ? "0000-0000" : "Ex: SBBD"}
                          className="h-8 text-sm"
                          value={editState.newPublisherData.code}
                          onChange={(e) => editState.setNewPublisherData({ ...editState.newPublisherData, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Qualis (Opcional)</Label>
                        <Select
                          value={editState.newPublisherData.stratum_qualis_id?.toString() || ""}
                          onValueChange={(value) => editState.setNewPublisherData({ ...editState.newPublisherData, stratum_qualis_id: parseInt(value) })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione o Qualis" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredQualis.map((q) => (
                              <SelectItem key={q.id} value={q.id.toString()}>
                                {q.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        className="w-full h-8 text-xs"
                        disabled={editState.isSubmittingNew}
                        onClick={handleCreateNewPublisher}
                      >
                        {editState.isSubmittingNew ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                        Confirmar e Selecionar
                      </Button>
                    </div>
                  )}

                  {editState.publisher && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">{editState.publisher.name}</p>
                          <p className="text-xs text-green-700">
                            {editState.publisher.publisher_type === 'journal'
                              ? `ISSN: ${editState.publisher.issns?.join(", ") || 'N/A'}`
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
          <Trash className="mr-1.5 h-4 w-4" /> Apagar
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
