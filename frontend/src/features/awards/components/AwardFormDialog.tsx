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
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ATTACHMENT_MAX_BYTES,
  Award,
  AwardCategory,
  AwardInput,
  RECIPIENT_TYPE_LABEL,
  SCOPE_LABEL,
} from "@/features/awards/types";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const currentYear = new Date().getFullYear();

const awardSchema = z.object({
  winners: z
    .array(
      z.object({
        name: z.string().min(2, "Informe o nome completo da pessoa premiada"),
        recipient_type: z.enum(["professor", "student", "staff"]),
      }),
    )
    .min(1, "Informe pelo menos uma pessoa premiada")
    .max(20, "No máximo 20 pessoas por prêmio"),
  year: z
    .string()
    .regex(/^\d{4}$/, "Informe um ano com 4 dígitos")
    .refine((v) => Number(v) >= 1990 && Number(v) <= currentYear, {
      message: `O ano deve estar entre 1990 e ${currentYear}`,
    }),
  scope: z.enum(["national", "international"]),
  category_id: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(10, "Descreva o prêmio em detalhes"),
  url: z
    .string()
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), {
      message: "O link deve começar com http:// ou https://",
    }),
  remove_attachment: z.boolean(),
  attachment: z
    .instanceof(File)
    .nullable()
    .refine((f) => !f || f.size <= ATTACHMENT_MAX_BYTES, {
      message: "O arquivo deve ter no máximo 10 MB",
    })
    .refine(
      (f) => !f || f.type === "application/pdf" || f.type.startsWith("image/"),
      { message: "Envie um PDF ou uma imagem" },
    ),
});

type AwardFormValues = z.infer<typeof awardSchema>;

const emptyValues: AwardFormValues = {
  winners: [{ name: "", recipient_type: "student" }],
  year: String(currentYear),
  scope: "national",
  category_id: "",
  description: "",
  url: "",
  remove_attachment: false,
  attachment: null,
};

interface AwardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Award | null;
  categories: AwardCategory[];
  onSave: (input: AwardInput) => Promise<void>;
}

export function AwardFormDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSave,
}: AwardFormDialogProps) {
  const form = useForm<AwardFormValues>({
    resolver: zodResolver(awardSchema),
    defaultValues: emptyValues,
  });

  const winners = useFieldArray({ control: form.control, name: "winners" });

  useFormErrorToast(form.formState.errors);

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? {
            winners: editing.winners.map((w) => ({ ...w })),
            year: String(editing.year),
            scope: editing.scope,
            category_id: String(editing.category_id),
            description: editing.description,
            url: editing.url ?? "",
            remove_attachment: false,
            attachment: null,
          }
        : emptyValues,
    );
  }, [editing, open, form]);

  const handleSubmit = async (values: AwardFormValues) => {
    await onSave({
      winners: values.winners,
      year: Number(values.year),
      scope: values.scope,
      category_id: Number(values.category_id),
      description: values.description,
      url: values.url || null,
      attachment: values.attachment,
      remove_attachment: values.remove_attachment,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Prêmio" : "Cadastrar Prêmio"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do prêmio ou reconhecimento recebido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <FormLabel>Vencedor(es) do prêmio</FormLabel>
              {winners.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_13rem_auto] gap-2 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`winners.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            aria-label={`Nome da pessoa ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`winners.${index}.recipient_type`}
                    render={({ field }) => (
                      <FormItem className="order-3 sm:order-none col-span-1">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger
                              className="w-full"
                              aria-label={`Vínculo da pessoa ${index + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(RECIPIENT_TYPE_LABEL).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Remover pessoa ${index + 1}`}
                    disabled={winners.fields.length === 1}
                    onClick={() => winners.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={winners.fields.length >= 20}
                onClick={() => winners.append({ name: "", recipient_type: "student" })}
              >
                <Plus className="h-4 w-4" />
                Adicionar pessoa
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano do destaque ou prêmio</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" maxLength={4} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abrangência</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SCOPE_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual a melhor categoria para o reconhecimento?</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descreva qual foi o prêmio em detalhes com o nome de todos envolvidos
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link para o prêmio (URL) — opcional</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { onChange, value: _value, ref, name, onBlur } }) => (
                <FormItem>
                  <FormLabel>Foto ou imagem do prêmio — opcional (PDF ou imagem, até 10 MB)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf,image/*"
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                    />
                  </FormControl>
                  {editing?.attachment_name && (
                    <p className="text-xs text-muted-foreground">
                      Arquivo atual: {editing.attachment_name}. Enviar outro arquivo o substitui.
                    </p>
                  )}
                </FormItem>
              )}
            />
            {editing?.attachment_name && (
              <FormField
                control={form.control}
                name="remove_attachment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Remover o arquivo atual</FormLabel>
                  </FormItem>
                )}
              />
            )}
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
