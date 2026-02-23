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
  FormDescription,
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
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const publisherFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  initials: z.string().max(255).optional().nullable(),
  issns: z.array(z.string()).optional(),
  publisher_type: z.enum(['journal', 'conference']).optional().nullable(),
  stratum_qualis_id: z.coerce.number().optional().nullable(),
});

type PublisherFormValues = z.infer<typeof publisherFormSchema>;

interface PublisherDialogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPublisher: Publisher | null;
  qualisOptions: StratumQualis[];
  onSave: (values: any) => Promise<void>;
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
      issns: [],
      publisher_type: 'journal',
      stratum_qualis_id: null,
    },
  });

  const [tagInput, setTagInput] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingPublisher) {
        form.reset({
          name: editingPublisher.name,
          initials: editingPublisher.initials || '',
          issns: editingPublisher.issns || [],
          publisher_type: editingPublisher.publisher_type as 'journal' | 'conference',
          stratum_qualis_id: editingPublisher.stratum_qualis_id || null,
        });
      } else {
        form.reset({
          name: '',
          initials: '',
          issns: [],
          publisher_type: 'journal',
          stratum_qualis_id: null,
        });
      }
      setTagInput('');
    }
  }, [editingPublisher, isOpen, form]);

  const handleSubmit = async (values: PublisherFormValues) => {
    const payload = {
      name: values.name,
      initials: values.initials,
      issns: values.issns || [],
      publisher_type: values.publisher_type,
      stratum_qualis_id: values.stratum_qualis_id,
    };

    await onSave(payload);
    onOpenChange(false);
  };

  const publisherType = form.watch('publisher_type');

  const addTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = form.getValues('issns') || [];
    const cleanIssn = tagInput.trim().replace(/-/g, "");
    if (!currentTags.includes(cleanIssn)) {
      form.setValue("issns", [...currentTags, cleanIssn]);
    }
    setTagInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="border p-4 rounded-md space-y-4 bg-muted/20">
                <div className="space-y-2">
                  <FormLabel className="font-bold text-primary">ISSNs</FormLabel>
                  <FormDescription className="text-xs">
                    Digite um ISSN e clique '+' ou pressione Enter. Clique no ISSN adicionado para editá-lo.
                  </FormDescription>
                  <div className="flex gap-2 mb-2 mt-2">
                    <Input
                      placeholder="Ex: 1234-5678"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('issns')?.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {editingTagIndex === idx ? (
                          <input
                            autoFocus
                            className="bg-transparent border-b border-primary outline-none text-center"
                            style={{ width: `${Math.max(tag.length, 5)}ch` }}
                            defaultValue={tag}
                            onBlur={(e) => {
                              const newTag = e.target.value.trim().replace(/-/g, "");
                              const tags = form.getValues('issns') || [];
                              if (newTag) {
                                tags[idx] = newTag;
                              } else {
                                tags.splice(idx, 1);
                              }
                              form.setValue('issns', [...tags]);
                              setEditingTagIndex(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }
                            }}
                          />
                        ) : (
                          <span className="cursor-pointer hover:underline" onClick={() => setEditingTagIndex(idx)}>
                            {tag}
                          </span>
                        )}
                        <button type="button" onClick={() => {
                          const tags = form.getValues('issns') || [];
                          tags.splice(idx, 1);
                          form.setValue('issns', [...tags]);
                        }}>
                          <X className="w-3 h-3 hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
