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
  SCOPE_LABEL,
} from "@/features/awards/types";
import { professorService } from "@/services/modules/professor.service";
import { studentService } from "@/services/modules/student.service";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const currentYear = new Date().getFullYear();

const awardSchema = z.object({
  winners: z
    .array(
      z.object({
        recipient_type: z.enum(["professor", "student"]),
        person_id: z.string(),
        name: z.string(),
        is_other: z.boolean(),
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
}).superRefine((values, ctx) => {
  values.winners.forEach((winner, index) => {
    if (winner.is_other) {
      if (winner.name.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["winners", index, "name"],
          message: "Informe o nome completo da pessoa premiada",
        });
      }
    } else if (!winner.person_id) {
      ctx.addIssue({
        code: "custom",
        path: ["winners", index, "person_id"],
        message: "Selecione a pessoa premiada",
      });
    }
  });
});

type AwardFormValues = z.infer<typeof awardSchema>;

const emptyValues: AwardFormValues = {
  winners: [{
    recipient_type: "professor",
    person_id: "",
    name: "",
    is_other: false,
  }],
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
  const { data: professorsData } = useQuery({
    queryKey: ["award-winners", "professors"],
    queryFn: () => professorService.fetchProfessors({ paginate: "false" }),
  });
  const { data: studentsData } = useQuery({
    queryKey: ["award-winners", "students"],
    queryFn: () => studentService.fetchStudents({ paginate: "false" }),
  });
  const professors = useMemo(
    () => professorsData?.data ?? [],
    [professorsData],
  );
  const students = useMemo(
    () => studentsData?.data ?? [],
    [studentsData],
  );

  const form = useForm<AwardFormValues>({
    resolver: zodResolver(awardSchema),
    defaultValues: emptyValues,
  });

  const winners = useFieldArray({ control: form.control, name: "winners" });

  useFormErrorToast(form.formState.errors);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const winnerValues = editing.winners.map((winner) => {
        const person = winner.recipient_type === "professor"
          ? professors.find((professor) => professor.name === winner.name)
          : winner.recipient_type === "student"
            ? students.find((student) => student.name === winner.name)
            : undefined;

        if (person) {
          return {
            recipient_type: winner.recipient_type as "professor" | "student",
            person_id: String(person.id),
            name: person.name,
            is_other: false,
          };
        }

        return {
          recipient_type: winner.recipient_type === "student"
            ? "student" as const
            : "professor" as const,
          person_id: "",
          name: winner.name,
          is_other: true,
        };
      });

      form.reset({
        winners: winnerValues,
        year: String(editing.year),
        scope: editing.scope,
        category_id: String(editing.category_id),
        description: editing.description,
        url: editing.url ?? "",
        remove_attachment: false,
        attachment: null,
      });
    } else {
      form.reset(emptyValues);
    }
  }, [editing, open, form, professors, students]);

  const handleSubmit = async (values: AwardFormValues) => {
    const submittedWinners = values.winners.map((winner) => {
      if (winner.is_other) {
        return {
          name: winner.name.trim(),
          recipient_type: winner.recipient_type,
        };
      }

      const person = winner.recipient_type === "professor"
        ? professors.find((professor) => professor.id === Number(winner.person_id))
        : students.find((student) => student.id === Number(winner.person_id));

      return {
        name: person?.name ?? "",
        recipient_type: winner.recipient_type,
      };
    }).filter((winner) => winner.name.length >= 2);

    await onSave({
      winners: submittedWinners,
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
              <FormLabel>Vencedores do prêmio</FormLabel>
              {winners.fields.map((field, index) => (
                <div key={field.id} className="space-y-2 rounded-md border p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`winners.${index}.recipient_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vínculo</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value: "professor" | "student") => {
                              field.onChange(value);
                              form.setValue(`winners.${index}.person_id`, "");
                              form.setValue(`winners.${index}.name`, "");
                              form.setValue(`winners.${index}.is_other`, false);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professor">Docente</SelectItem>
                              <SelectItem value="student">Discente</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {form.watch(`winners.${index}.is_other`) ? (
                      <FormField
                        control={form.control}
                        name={`winners.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Informe o nome" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name={`winners.${index}.person_id`}
                        render={({ field }) => {
                          const recipientType = form.watch(
                            `winners.${index}.recipient_type`,
                          );
                          const options =
                            recipientType === "professor" ? professors : students;

                          return (
                            <FormItem>
                              <FormLabel>
                                {recipientType === "professor"
                                  ? "Docente"
                                  : "Discente"}
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={
                                        recipientType === "professor"
                                          ? "Selecione um docente"
                                          : "Selecione um discente"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-72">
                                  {options.map((person) => (
                                    <SelectItem
                                      key={person.id}
                                      value={String(person.id)}
                                    >
                                      {person.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          );
                        }}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`winners.${index}.is_other`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true);
                              if (checked === true) {
                                form.setValue(`winners.${index}.person_id`, "");
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Outro
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {winners.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => winners.remove(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remover vencedor
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={winners.fields.length >= 20}
                onClick={() =>
                  winners.append({
                    recipient_type: "professor",
                    person_id: "",
                    name: "",
                    is_other: false,
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Adicionar vencedor
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
