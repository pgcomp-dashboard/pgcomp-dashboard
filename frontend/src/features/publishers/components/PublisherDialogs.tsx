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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Publisher, StratumQualis } from "@/types/academic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const publisherFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  initials: z.string().max(255).optional().nullable(),
  issn: z.string().max(255).optional().nullable(),
  publisher_type: z.enum(['journal', 'conference']).optional().nullable(),
  stratum_qualis_id: z.coerce.number().optional().nullable(),
});

type PublisherFormValues = z.infer<typeof publisherFormSchema>;

interface PublisherDialogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPublisher: Publisher | null;
  qualisOptions: StratumQualis[];
  onSave: (values: PublisherFormValues) => Promise<void>;
}

export function PublisherDialogs({
  isOpen,
  onOpenChange,
  editingPublisher,
  qualisOptions,
  onSave,
}: PublisherDialogsProps) {
  const form = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: {
      name: '',
      initials: '',
      issn: '',
      publisher_type: 'journal',
      stratum_qualis_id: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingPublisher) {
        form.reset({
          name: editingPublisher.name,
          initials: editingPublisher.initials || '',
          issn: editingPublisher.issn || '',
          publisher_type: editingPublisher.publisher_type as 'journal' | 'conference',
          stratum_qualis_id: editingPublisher.stratum_qualis_id || null,
        });
      } else {
        form.reset({
          name: '',
          initials: '',
          issn: '',
          publisher_type: 'journal',
          stratum_qualis_id: null,
        });
      }
    }
  }, [editingPublisher, isOpen, form]);

  const handleSubmit = async (values: PublisherFormValues) => {
    await onSave(values);
    onOpenChange(false);
  };

  const publisherType = form.watch('publisher_type');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{editingPublisher ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
          <DialogDescription>
            {editingPublisher
              ? 'Atualize as informações do veículo de publicação.'
              : 'Preencha as informações para cadastrar um novo veículo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do veículo" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              {publisherType === 'conference' && (
                <FormField
                  control={form.control}
                  name="initials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sigla</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SIGMOD" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {publisherType === 'journal' && (
                <FormField
                  control={form.control}
                  name="issn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISSN</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 0000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publisher_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'journal'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="journal">Periódico</SelectItem>
                        <SelectItem value="conference">Conferência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stratum_qualis_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualis</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'none' ? null : Number(val))}
                      value={field.value?.toString() || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Qualis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {qualisOptions
                          .filter(q => !publisherType || q.type === publisherType)
                          .map((q) => (
                            <SelectItem key={q.id} value={q.id.toString()}>
                              {q.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
