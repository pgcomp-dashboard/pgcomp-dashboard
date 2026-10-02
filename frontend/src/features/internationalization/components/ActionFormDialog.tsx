import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ActionInput,
  COURSE_LABEL,
  DOCUMENT_MAX_BYTES,
  FILE_SLOT_LABEL,
  FILE_SLOTS,
  FileSlot,
  InternationalizationAction,
  InternationalizationCategory,
  LATTES_LABEL,
  LEVEL_LABEL,
  PHOTO_MAX_BYTES,
} from "@/features/internationalization/types";
import useAuth from "@/hooks/auth";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida");

const slotSchema = (kind: "document" | "photo") =>
  z.object({
    file: z
      .instanceof(File)
      .nullable()
      .refine(
        (f) => !f || f.size <= (kind === "document" ? DOCUMENT_MAX_BYTES : PHOTO_MAX_BYTES),
        { message: kind === "document" ? "O PDF deve ter no máximo 1 MB" : "A foto deve ter no máximo 10 MB" },
      )
      .refine(
        (f) => !f || (kind === "document" ? f.type === "application/pdf" : f.type.startsWith("image/")),
        { message: kind === "document" ? "Envie um arquivo PDF" : "Envie uma imagem" },
      ),
    remove: z.boolean(),
  });

const schema = z
  .object({
    category_id: z.string().min(1, "Selecione uma categoria"),
    full_name: z.string().min(2, "Informe o nome completo"),
    registration_number: z.string().min(1, "Informe a matrícula ou o SIAPE"),
    level: z.enum(["professor", "student"]),
    course: z.enum(["masters", "doctorate", "professor"]),
    lattes_status: z.enum(["registered", "pending"]),
    advisor_name: z.string(),
    country: z.string(),
    institution: z.string(),
    foreign_research_group: z.string(),
    foreign_researcher: z.string(),
    description: z.string().min(10, "Descreva a atividade em detalhes"),
    start_date: dateField,
    end_date: dateField,
    call_notice: z.string(),
    url: z
      .string()
      .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), {
        message: "O link deve começar com http:// ou https://",
      }),
    files: z.object({
      document: slotSchema("document"),
      photo_1: slotSchema("photo"),
      photo_2: slotSchema("photo"),
      photo_3: slotSchema("photo"),
    }),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "O fim do período não pode ser antes do início",
    path: ["end_date"],
  });

type FormValues = z.infer<typeof schema>;

const emptyFiles = () => ({
  document: { file: null, remove: false },
  photo_1: { file: null, remove: false },
  photo_2: { file: null, remove: false },
  photo_3: { file: null, remove: false },
});

const emptyValues = (): FormValues => ({
  category_id: "",
  full_name: "",
  registration_number: "",
  level: "student",
  course: "masters",
  lattes_status: "registered",
  advisor_name: "",
  country: "",
  institution: "",
  foreign_research_group: "",
  foreign_researcher: "",
  description: "",
  start_date: "",
  end_date: "",
  call_notice: "",
  url: "",
  files: emptyFiles(),
});

interface ActionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: InternationalizationAction | null;
  categories: InternationalizationCategory[];
  onSave: (input: ActionInput) => Promise<void>;
}

export function ActionFormDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSave,
}: ActionFormDialogProps) {
  const auth = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useFormErrorToast(form.formState.errors);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        category_id: String(editing.category_id),
        full_name: editing.full_name,
        registration_number: editing.registration_number,
        level: editing.level,
        course: editing.course,
        lattes_status: editing.lattes_status,
        advisor_name: editing.advisor_name ?? "",
        country: editing.country ?? "",
        institution: editing.institution ?? "",
        foreign_research_group: editing.foreign_research_group ?? "",
        foreign_researcher: editing.foreign_researcher ?? "",
        description: editing.description,
        start_date: editing.start_date,
        end_date: editing.end_date,
        call_notice: editing.call_notice ?? "",
        url: editing.url ?? "",
        files: emptyFiles(),
      });
      return;
    }
    // Novo cadastro: já preenche o que dá para saber de quem está logado.
    const isProfessor = auth?.user?.type === "professor";
    form.reset({
      ...emptyValues(),
      full_name: auth?.user?.name ?? "",
      level: isProfessor ? "professor" : "student",
      course: isProfessor ? "professor" : "masters",
    });
  }, [editing, open, form, auth?.user?.name, auth?.user?.type]);

  const handleSubmit = async (values: FormValues) => {
    const files: ActionInput["files"] = {};
    const remove: FileSlot[] = [];
    FILE_SLOTS.forEach((slot) => {
      const entry = values.files[slot];
      if (entry.file) files[slot] = entry.file;
      else if (entry.remove) remove.push(slot);
    });

    await onSave({
      ...values,
      category_id: Number(values.category_id),
      files,
      remove_files: remove,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar ação de internacionalização" : "Cadastrar ação de internacionalização"}
          </DialogTitle>
          <DialogDescription>
            Os campos com * são obrigatórios. Estes dados alimentam o relatório da quadrienal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
            <Section title="Ação">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Categoria *</FormLabel>
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
              <TextField form={form} name="start_date" label="Início do período *" type="date" />
              <TextField form={form} name="end_date" label="Fim do período *" type="date" />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Descrição completa da atividade *</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <TextField form={form} name="call_notice" label="Edital ou chamada associada" />
              <TextField form={form} name="url" label="Link da ação de internacionalização" placeholder="https://" />
              <FormField
                control={form.control}
                name="lattes_status"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Você já cadastrou essa ação no Lattes? *</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Lembrando que agora a CAPES irá extrair tudo do Lattes do pesquisador para a avaliação quadrienal.
                    </p>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LATTES_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Pessoa">
              <TextField form={form} name="full_name" label="Nome completo *" />
              <TextField
                form={form}
                name="registration_number"
                label="Matrícula do PGCOMP (discentes) ou SIAPE (docentes) *"
                hint="Se você é egresso, use a matrícula de quando realizou a ação."
              />
              <SelectField form={form} name="level" label="Nível *" options={LEVEL_LABEL} />
              <SelectField form={form} name="course" label="Curso *" options={COURSE_LABEL} />
              <TextField
                form={form}
                name="advisor_name"
                label="Se discente, nome do professor do PGCOMP responsável"
                className="sm:col-span-2"
              />
            </Section>

            <Section title="No exterior">
              <TextField form={form} name="country" label="País da ação ou atividade no exterior" />
              <TextField form={form} name="institution" label="Universidade, instituição ou conferência no exterior" />
              <TextField form={form} name="foreign_research_group" label="Grupo de pesquisa do exterior" />
              <TextField form={form} name="foreign_researcher" label="Pesquisador ou professor responsável no exterior" />
            </Section>

            <Section title="Documentos e fotos (opcionais)">
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                As fotos podem ser no prédio da instituição estrangeira, com o orientador ou no banner do evento.
                Serão usadas para publicização nas redes sociais do PGCOMP.
              </p>
              {FILE_SLOTS.map((slot) => (
                <FileField key={slot} form={form} slot={slot} currentName={editing?.files[slot] ?? null} />
              ))}
            </Section>

            <DialogFooter className="pt-2">
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

type TextFieldName =
  | "full_name" | "registration_number" | "advisor_name" | "country" | "institution"
  | "foreign_research_group" | "foreign_researcher" | "start_date" | "end_date" | "call_notice" | "url";

function TextField({
  form, name, label, hint, type = "text", placeholder, className,
}: {
  form: UseFormReturn<FormValues>;
  name: TextFieldName;
  label: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function SelectField({
  form, name, label, options,
}: {
  form: UseFormReturn<FormValues>;
  name: "level" | "course";
  label: string;
  options: Record<string, string>;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(options).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

function FileField({
  form, slot, currentName,
}: {
  form: UseFormReturn<FormValues>;
  slot: FileSlot;
  currentName: string | null;
}) {
  const isDocument = slot === "document";
  return (
    <FormField
      control={form.control}
      name={`files.${slot}.file`}
      render={({ field: { onChange, value: _value, ref, name, onBlur } }) => (
        <FormItem>
          <FormLabel>
            {FILE_SLOT_LABEL[slot]} — {isDocument ? "PDF, até 1 MB" : "imagem, até 10 MB"}
          </FormLabel>
          <FormControl>
            <Input
              type="file"
              accept={isDocument ? "application/pdf" : "image/*"}
              ref={ref}
              name={name}
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </FormControl>
          {currentName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FormField
                control={form.control}
                name={`files.${slot}.remove`}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    aria-label={`Remover ${FILE_SLOT_LABEL[slot]}`}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <span>Arquivo atual: {currentName}. Remover (ou envie outro para substituir).</span>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
