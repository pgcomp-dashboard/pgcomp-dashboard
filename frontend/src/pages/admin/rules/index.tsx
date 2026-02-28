import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Edit, Plus, Settings2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { parseApiError } from "@/services/http-client";
import { Configuration, configurationService } from "@/services/modules/configuration.service";
import { toast } from "sonner";

const ruleSchema = z.object({
  group: z.string().min(1, "Grupo é obrigatório"),
  key: z.string().min(1, "Chave é obrigatória"),
  value: z.string().nullable().refine((val) => {
    if (!val) return true;
    return true; // Simple string check, will refine for JSON below
  }),
  jsonValues: z.array(z.object({
    key: z.string().min(1, "Chave é obrigatória"),
    value: z.string().min(1, "Valor é obrigatório")
  })).optional(),
  type: z.enum(["string", "integer", "float", "boolean", "json"]),
  description: z.string().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === "json" && data.value) {
    try {
      JSON.parse(data.value);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JSON inválido",
        path: ["value"],
      });
    }
  }
});

type RuleFormValues = z.infer<typeof ruleSchema>;

export default function RulesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Configuration | null>(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => configurationService.getAll(),
  });

  const uniqueGroups = Array.from(new Set(rules?.map((r) => r.group) || []));

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      group: "",
      key: "",
      value: "",
      jsonValues: [],
      type: "string",
      description: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "jsonValues",
  });

  const watchType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: (data: RuleFormValues) => configurationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      toast.success("Regra criada com sucesso");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao criar regra: " + parseApiError(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RuleFormValues) =>
      configurationService.update(editingRule!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      toast.success("Regra atualizada com sucesso");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar regra: " + parseApiError(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => configurationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      toast.success("Regra excluída com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao excluir regra: " + parseApiError(error));
    },
  });

  function onSubmit(values: RuleFormValues) {
    const submitValues = { ...values };

    if (submitValues.type === "json") {
      // Serialize array to deep object or flat object depending on your needs.
      // Here we create a simple flat object: { key1: val1, key2: val2 }
      const jsonObj = submitValues.jsonValues?.reduce((acc, curr) => {
        // try parsing numbers/booleans dynamically or keep as string
        let finalVal: string | number | boolean | string[] = curr.value;
        if (!isNaN(Number(curr.value)) && curr.value.trim() !== '') {
          finalVal = Number(curr.value);
        } else if (curr.value === 'true' || curr.value === 'false') {
          finalVal = curr.value === 'true';
        } else if (typeof curr.value === 'string' && curr.value.includes(',')) {
          finalVal = curr.value.split(',').map(s => s.trim());
        }
        acc[curr.key] = finalVal;
        return acc;
      }, {} as Record<string, any>);

      submitValues.value = JSON.stringify(jsonObj);
    } else {
      submitValues.jsonValues = []; // clear if not json
    }

    // Prepare for backend
    const payload = {
      group: submitValues.group,
      key: submitValues.key,
      value: submitValues.value,
      type: submitValues.type,
      description: submitValues.description,
    };

    if (editingRule) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleEdit(rule: Configuration) {
    setEditingRule(rule);

    let parsedJsonValues: { key: string; value: string }[] = [];
    if (rule.type === 'json' && rule.casted_value) {
      try {
        // Convert existing object back to array of {key, value} for the UI
        parsedJsonValues = Object.entries(rule.casted_value).map(([k, v]) => ({
          key: k,
          value: Array.isArray(v) ? v.join(', ') : String(v)
        }));
      } catch (e) {
        console.error("Failed to parse existing json for edit", e);
      }
    }

    form.reset({
      group: rule.group,
      key: rule.key,
      value: rule.value,
      type: rule.type,
      jsonValues: parsedJsonValues,
      description: rule.description,
    });
    setIsDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm("Tem certeza que deseja excluir esta regra?")) {
      deleteMutation.mutate(id);
    }
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingRule(null);
    form.reset({
      group: "",
      key: "",
      value: "",
      jsonValues: [],
      type: "string",
      description: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="h-8 w-8" />
            Regras do Sistema
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações e regras de validação do dashboard.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Editar Regra" : "Criar Nova Regra"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo (Categoria)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? field.value
                                  : "Selecione ou digite um grupo..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[375px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Procurar grupo..."
                                onValueChange={(search) => {
                                  // This allows typing a custom value that isn't in the list
                                  form.setValue('group', search)
                                }}
                              />
                              <CommandList>
                                <CommandEmpty>Nenhum grupo encontrado. Pressione Enter para adicionar.</CommandEmpty>
                                <CommandGroup>
                                  {uniqueGroups.map((group) => (
                                    <CommandItem
                                      value={group}
                                      key={group}
                                      onSelect={() => {
                                        form.setValue("group", group)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          group === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {group}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave (ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: ano_inicial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="integer">Inteiro</SelectItem>
                            <SelectItem value="float">Decimal (Float)</SelectItem>
                            <SelectItem value="boolean">Booleano</SelectItem>
                            <SelectItem value="json">JSON/Array</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchType !== "json" ? (
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input placeholder="Valor da regra" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </div>

                {watchType === "json" && (
                  <div className="space-y-4 border p-4 rounded-md bg-muted/50">
                    <div className="flex items-center justify-between">
                      <FormLabel>Regras Combinadas (JSON)</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => append({ key: "", value: "" })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Propriedade
                      </Button>
                    </div>
                    {fields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma propriedade adicionada.
                      </p>
                    )}
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name={`jsonValues.${index}.key`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Chave (ex: min_a1)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`jsonValues.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Valor (ex: 3 ou true)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Para que serve esta regra?"
                          {...field}
                          value={field.value || ""}
                        />
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingRule ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Chave</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Carregando regras...
                </TableCell>
              </TableRow>
            ) : rules && rules.length > 0 ? (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.group}</TableCell>
                  <TableCell>{rule.key}</TableCell>
                  <TableCell>
                    {rule.type === 'json' ? (
                      <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto max-w-[200px]">
                        {JSON.stringify(rule.casted_value, null, 2)}
                      </pre>
                    ) : (
                      <code className="bg-muted px-1 rounded text-xs">
                        {rule.value}
                      </code>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                      {rule.type === 'float' ? 'decimal' : rule.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma regra cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
