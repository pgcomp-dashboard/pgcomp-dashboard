import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnswersSummary } from "@/features/defense-requests/components/AnswersSummary";
import { MemberSlot } from "@/features/defense-requests/components/MemberSlot";
import { StudentPicker } from "@/features/defense-requests/components/StudentPicker";
import {
  DefenseAnswers,
  DefenseForm,
  DefenseFormField,
  DefenseLevel,
  DefenseRequest,
  DefenseStage,
  isMember,
  LEVEL_LABEL,
  MemberValue,
  PersonRef,
  STAGE_LABEL,
  StudentOption,
} from "@/features/defense-requests/types";
import { cn } from "@/lib/utils";
import { DefenseRequestInput } from "@/services/modules/defense-request.service";
import { Check, ChevronLeft, ChevronRight, Info, Plus, Send } from "lucide-react";
import { useMemo, useState } from "react";

/** Quem preenche: o discente abre para si; o orientador abre para um orientando ou revisa. */
export type DefensePersona = "student" | "advisor";

interface DefenseRequestWizardProps {
  forms: DefenseForm[];
  persona: DefensePersona;
  me: PersonRef;
  /** Discente: ele mesmo, já com curso e orientador do cadastro. */
  self?: StudentOption | null;
  /** Revisão pelo orientador de uma solicitação aberta pelo orientando. */
  reviewing?: DefenseRequest | null;
  isSubmitting: boolean;
  onSubmit: (input: DefenseRequestInput) => Promise<unknown>;
  onCancel: () => void;
}

const SECTION = {
  student: "Discente e orientação",
  work: "Trabalho",
  committee: "Banca examinadora",
  schedule: "Data e horário",
  confirmations: "Confirmações",
} as const;

const STEPS = [
  { id: "student", title: "Discente e tipo", section: SECTION.student },
  { id: "work", title: "Trabalho", section: SECTION.work },
  { id: "committee", title: "Banca", section: SECTION.committee },
  { id: "schedule", title: "Data e horário", section: SECTION.schedule },
  { id: "review", title: "Revisão e envio", section: SECTION.confirmations },
] as const;

const LATTES = /^https?:\/\/\S+$/i;

/**
 * Wizard da solicitação de banca. Cada etapa mostra só um grupo de campos; o que
 * o portal já sabe (discente, nível pelo curso, orientador, coorientador, afiliação
 * e Lattes dos docentes) chega preenchido.
 */
export function DefenseRequestWizard({ forms, persona, me, self, reviewing, isSubmitting, onSubmit, onCancel }: DefenseRequestWizardProps) {
  const reviewForm = reviewing ? forms.find((f) => f.type === reviewing.type) : undefined;

  const [student, setStudent] = useState<StudentOption | null>(() => {
    if (reviewing) {
      return {
        id: reviewing.student_user_id ?? 0,
        name: (reviewing.answers.student_name as string) ?? "",
        registration: null,
        level: reviewForm?.level ?? null,
        advisor: me,
        co_advisor: reviewing.answers.co_advisor ? { id: 0, name: reviewing.answers.co_advisor as string } : null,
        is_mine: true,
      };
    }
    return persona === "student" ? (self ?? null) : null;
  });
  const [level, setLevel] = useState<DefenseLevel | null>(reviewForm?.level ?? self?.level ?? null);
  const [stage, setStage] = useState<DefenseStage | null>(reviewForm?.stage ?? null);
  const [answers, setAnswers] = useState<DefenseAnswers>(() => (reviewing ? { ...reviewing.answers } : initialAnswers(persona, me, self)));
  const [step, setStep] = useState(reviewing ? STEPS.length - 1 : 0);
  const [reached, setReached] = useState(reviewing ? STEPS.length - 1 : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openOptional, setOpenOptional] = useState<string[]>([]);
  const [editLevel, setEditLevel] = useState(false);
  const [editCoAdvisor, setEditCoAdvisor] = useState(false);

  const form = useMemo(() => forms.find((f) => f.level === level && f.stage === stage), [forms, level, stage]);
  const fieldsOf = (section: string) => form?.fields.filter((f) => f.section === section) ?? [];
  const set = (key: string, value: DefenseAnswers[string]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const { [key]: _drop, ...rest } = prev;
      return rest;
    });
  };

  const chooseStudent = (s: StudentOption) => {
    setStudent(s);
    if (s.level) setLevel(s.level);
    setAnswers((prev) => ({
      ...prev,
      student_name: s.name,
      advisor: persona === "advisor" ? me.name : (s.advisor?.name ?? ""),
      co_advisor: s.co_advisor?.name ?? "",
    }));
    setErrors({});
  };

  // ---- validação por etapa -------------------------------------------------
  const validate = (index: number): boolean => {
    const next: Record<string, string> = {};
    const stepDef = STEPS[index];

    if (stepDef.id === "student") {
      if (!student) next.student = persona === "advisor" ? "Escolha o orientando." : "Seu cadastro não foi encontrado.";
      if (!level) next.level = "Escolha o nível.";
      if (!stage) next.stage = "Escolha entre qualificação e defesa.";
      if (student && !answers.advisor) next.advisor = "Seu cadastro não tem orientador vinculado. Peça à secretaria para vincular.";
    } else {
      for (const field of fieldsOf(stepDef.section)) {
        if (field.type === "confirm" && persona === "student") continue;
        const message = fieldError(field, answers[field.key], openOptional.includes(field.key));
        if (message) next[field.key] = message;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTo = (index: number) => {
    if (index <= reached) {
      setStep(index);
      return;
    }
    // Avançar: valida cada etapa até o destino.
    for (let i = step; i < index; i++) {
      if (!validate(i)) {
        setStep(i);
        return;
      }
    }
    setStep(index);
    setReached((r) => Math.max(r, index));
    setErrors({});
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validate(i)) {
        setStep(i);
        return;
      }
    }
    if (!form) return;
    const data: DefenseAnswers = {};
    for (const field of form.fields) {
      const value = answers[field.key];
      data[field.key] = field.type === "confirm" ? value === true : field.type === "member" ? (isMember(value) && value.name ? value : null) : (value ?? null);
    }
    await onSubmit({ type: form.type, data, student_user_id: student?.id || null });
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <Stepper step={step} reached={reached} onGo={goTo} />

      <div className="min-h-[280px] space-y-5">
        <div>
          <h2 className="text-lg font-semibold">{current.title}</h2>
          {form && step > 0 && <p className="text-sm text-muted-foreground">{form.title} · {answers.student_name as string}</p>}
        </div>

        {current.id === "student" && (
          <div className="space-y-6">
            {persona === "advisor" && !reviewing && (
              <div className="space-y-2">
                <Label htmlFor="defense-student">Discente *</Label>
                <StudentPicker value={student} onChange={chooseStudent} />
                {errors.student && <p className="text-xs font-medium text-destructive">{errors.student}</p>}
              </div>
            )}

            {student && (
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-3" aria-label="Dados do cadastro">
                <Fact label={persona === "student" ? "Discente (você)" : "Discente"} value={student.name} />
                <Fact
                  label="Orientador"
                  value={(answers.advisor as string) || "—"}
                  hint={persona === "advisor" ? "você" : "do cadastro"}
                  error={errors.advisor}
                />
                <div>
                  <p className="text-xs text-muted-foreground">Coorientador</p>
                  {editCoAdvisor ? (
                    <Input aria-label="Coorientador" className="mt-1 h-8" value={(answers.co_advisor as string) ?? ""} onChange={(e) => set("co_advisor", e.target.value)} />
                  ) : (
                    <p className="font-medium">
                      {(answers.co_advisor as string) || "Nenhum"}{" "}
                      <button type="button" className="text-xs font-normal text-primary hover:underline" onClick={() => setEditCoAdvisor(true)}>
                        alterar
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}

            {student && (
              <div className="space-y-2">
                <Label>Nível *</Label>
                {level && !editLevel ? (
                  <p className="text-sm">
                    <span className="font-medium">{LEVEL_LABEL[level]}</span>
                    <span className="text-muted-foreground"> (pelo curso do discente) </span>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setEditLevel(true)}>
                      alterar
                    </button>
                  </p>
                ) : (
                  <ChoiceRow
                    name="Nível"
                    options={(["mestrado", "doutorado"] as const).map((v) => ({ value: v, label: LEVEL_LABEL[v] }))}
                    value={level}
                    onChange={(v) => {
                      setLevel(v);
                      setEditLevel(false);
                    }}
                  />
                )}
                {errors.level && <p className="text-xs font-medium text-destructive">{errors.level}</p>}
              </div>
            )}

            {student && level && (
              <div className="space-y-2">
                <Label>O que vai acontecer? *</Label>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Etapa">
                  {(["qualification", "defense"] as const).map((v) => {
                    const target = forms.find((f) => f.level === level && f.stage === v);
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={stage === v}
                        onClick={() => {
                          setStage(v);
                          setErrors((e) => ({ ...e, stage: "" }));
                        }}
                        className={cn(
                          "rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                          stage === v && "border-primary bg-primary/5 ring-1 ring-primary",
                        )}
                      >
                        <p className="font-semibold">{STAGE_LABEL[v]}</p>
                        <p className="text-sm text-muted-foreground">{target?.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {target ? `${target.fields.filter((f) => f.type === "member" && f.required).length} membros obrigatórios` : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.stage && <p className="text-xs font-medium text-destructive">{errors.stage}</p>}
              </div>
            )}
          </div>
        )}

        {current.id === "work" &&
          fieldsOf(SECTION.work).map((field) => (
            <TextField key={field.key} field={field} value={(answers[field.key] as string) ?? ""} onChange={(v) => set(field.key, v)} error={errors[field.key]} />
          ))}

        {current.id === "committee" && (
          <CommitteeStep
            fields={fieldsOf(SECTION.committee)}
            answers={answers}
            errors={errors}
            openOptional={openOptional}
            setOpenOptional={setOpenOptional}
            onChange={set}
          />
        )}

        {current.id === "schedule" && (
          <ScheduleStep fields={fieldsOf(SECTION.schedule)} answers={answers} errors={errors} onChange={set} />
        )}

        {current.id === "review" && form && (
          <div className="space-y-6">
            <AnswersSummary
              form={form}
              answers={answers}
              skipSections={[SECTION.confirmations]}
              hideEmptyOptional
              onEditSection={(section) => goTo(STEPS.findIndex((s) => s.section === section))}
            />

            {persona === "advisor" ? (
              <section className="space-y-3" aria-label="Confirmações do orientador">
                <h3 className="border-b pb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Confirmações do orientador</h3>
                {fieldsOf(SECTION.confirmations).map((field) => (
                  <div key={field.key} className={cn("flex items-start gap-3 rounded-md border p-3", errors[field.key] && "border-destructive/60")}>
                    <Checkbox
                      id={`confirm-${field.key}`}
                      checked={answers[field.key] === true}
                      onCheckedChange={(checked) => set(field.key, checked === true)}
                      aria-label={field.label}
                    />
                    <Label htmlFor={`confirm-${field.key}`} className="font-normal leading-snug">
                      {field.label}
                      {field.required && " *"}
                    </Label>
                  </div>
                ))}
                {Object.keys(errors).some((k) => k.startsWith("confirm_")) && (
                  <p className="text-xs font-medium text-destructive">Marque as confirmações obrigatórias para enviar.</p>
                )}
              </section>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Ao enviar, a solicitação vai para <strong>{(answers.advisor as string) || "seu orientador"}</strong> revisar. As confirmações
                  (proficiência, pendências, egresso) são declarações do orientador, e ele as marca antes de enviar à coordenação.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="ghost" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4" /> {step === 0 ? "Cancelar" : "Voltar"}
        </Button>
        {isLast ? (
          <Button type="button" onClick={submit} disabled={isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? "Enviando…" : persona === "student" ? "Enviar para o orientador" : "Enviar à coordenação"}
          </Button>
        ) : (
          <Button type="button" onClick={() => goTo(step + 1)}>
            Próximo <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function initialAnswers(persona: DefensePersona, me: PersonRef, self?: StudentOption | null): DefenseAnswers {
  if (persona === "student" && self) {
    return { student_name: self.name, advisor: self.advisor?.name ?? "", co_advisor: self.co_advisor?.name ?? "" };
  }
  return { advisor: me.name };
}

function fieldError(field: DefenseFormField, value: DefenseAnswers[string] | undefined, optionalOpen: boolean): string | null {
  if (field.type === "confirm") return field.required && value !== true ? "Marque para confirmar" : null;
  if (field.type === "member") {
    const member = isMember(value) && value.name.trim() ? (value as MemberValue) : null;
    if (!member) return field.required ? "Escolha um membro." : optionalOpen ? "Escolha um membro ou remova a vaga." : null;
    if (!member.affiliation.trim()) return "Informe a afiliação.";
    if (field.lattes_required && !member.lattes) return "Informe o link do Lattes.";
    if (member.lattes && !LATTES.test(member.lattes)) return "O Lattes deve ser um link (http://…).";
    return null;
  }
  const text = typeof value === "string" ? value.trim() : "";
  return field.required && !text ? "Campo obrigatório" : null;
}

// ---- partes da tela ---------------------------------------------------------

function Stepper({ step, reached, onGo }: { step: number; reached: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Etapas">
      {STEPS.map((s, i) => {
        const done = i < step || (i <= reached && i !== step);
        return (
          <li key={s.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onGo(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-1 py-0.5 text-sm transition-colors",
                i === step ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                  i === step && "border-primary bg-primary text-primary-foreground",
                  done && i !== step && "border-primary text-primary",
                )}
              >
                {done && i !== step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-border sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}

function Fact({ label, value, hint, error }: { label: string; value: string; hint?: string; error?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
        {hint && <span> · {hint}</span>}
      </p>
      <p className="font-medium">{value}</p>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function ChoiceRow<T extends string>({ name, options, value, onChange }: { name: string; options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <Button key={o.value} type="button" role="radio" aria-checked={value === o.value} variant={value === o.value ? "default" : "outline"} size="sm" onClick={() => onChange(o.value)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}

function TextField({ field, value, onChange, error }: { field: DefenseFormField; value: string; onChange: (v: string) => void; error?: string }) {
  const id = `field-${field.key}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {field.label}
        {field.required && " *"}
      </Label>
      {field.type === "textarea" ? (
        <>
          <Textarea id={id} name={field.key} rows={field.key === "abstract" ? 6 : 3} value={value} onChange={(e) => onChange(e.target.value)} />
          <p className="text-right text-xs text-muted-foreground">{value.length} caracteres</p>
        </>
      ) : (
        <Input id={id} name={field.key} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function CommitteeStep({
  fields,
  answers,
  errors,
  openOptional,
  setOpenOptional,
  onChange,
}: {
  fields: DefenseFormField[];
  answers: DefenseAnswers;
  errors: Record<string, string>;
  openOptional: string[];
  setOpenOptional: (fn: (prev: string[]) => string[]) => void;
  onChange: (key: string, value: DefenseAnswers[string]) => void;
}) {
  // Orientador e coorientador já estão na banca; não aparecem como sugestão.
  const advisors = [answers.advisor, answers.co_advisor].filter((n): n is string => typeof n === "string" && !!n);
  const names = (except: string) => [
    ...advisors,
    ...fields.filter((f) => f.key !== except).map((f) => answers[f.key]).filter(isMember).map((m) => m.name),
  ];
  const hasValue = (f: DefenseFormField) => isMember(answers[f.key]) && !!(answers[f.key] as MemberValue).name;

  const renderGroup = (title: string, group: DefenseFormField[]) => {
    const required = group.filter((f) => f.required);
    // Vagas opcionais ficam escondidas até o usuário pedir (ou já terem valor).
    const optional = group.filter((f) => !f.required);
    const shownOptional = optional.filter((f) => openOptional.includes(f.key) || hasValue(f));
    const nextOptional = optional.find((f) => !shownOptional.includes(f));
    if (!group.length) return null;

    return (
      <section className="space-y-3" aria-label={title}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {[...required, ...shownOptional].map((field) => (
            <MemberSlot
              key={field.key}
              field={field}
              value={isMember(answers[field.key]) ? (answers[field.key] as MemberValue) : null}
              onChange={(v) => onChange(field.key, v)}
              error={errors[field.key]}
              takenNames={names(field.key)}
              onRemove={
                field.required
                  ? undefined
                  : () => {
                      onChange(field.key, null);
                      setOpenOptional((prev) => prev.filter((k) => k !== field.key));
                    }
              }
            />
          ))}
        </div>
        {nextOptional && (
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setOpenOptional((prev) => [...prev, nextOptional.key])}>
            <Plus className="h-4 w-4" /> Adicionar {nextOptional.substitute ? "suplente" : "titular"} opcional
          </Button>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Busque pelo nome: docentes do PGCOMP vêm com afiliação e Lattes do cadastro, e externos de bancas anteriores vêm com os dados já
        informados.
      </p>
      {renderGroup("Titulares", fields.filter((f) => !f.substitute))}
      {renderGroup("Suplentes", fields.filter((f) => f.substitute))}
    </div>
  );
}

function ScheduleStep({
  fields,
  answers,
  errors,
  onChange,
}: {
  fields: DefenseFormField[];
  answers: DefenseAnswers;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const date = answers.date as string | undefined;
  const hint = (() => {
    if (!date) return null;
    const [y, m, d] = date.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((day.getTime() - today.getTime()) / 86_400_000);
    const weekday = day.toLocaleDateString("pt-BR", { weekday: "long" });
    if (diff < 0) return { text: `${weekday} · esta data já passou`, warn: true };
    if (diff === 0) return { text: `${weekday} · hoje`, warn: true };
    return { text: `${weekday} · daqui a ${diff} dia${diff > 1 ? "s" : ""}`, warn: false };
  })();

  return (
    <div className="grid gap-4 sm:max-w-md sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`field-${field.key}`}>
            {field.label}
            {field.required && " *"}
          </Label>
          <Input
            id={`field-${field.key}`}
            name={field.key}
            type={field.type}
            value={(answers[field.key] as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
          {field.type === "date" && hint && <p className={cn("text-xs", hint.warn ? "text-amber-600" : "text-muted-foreground")}>{hint.text}</p>}
          {errors[field.key] && <p className="text-xs font-medium text-destructive">{errors[field.key]}</p>}
        </div>
      ))}
    </div>
  );
}
