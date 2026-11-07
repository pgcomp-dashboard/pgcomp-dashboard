import { Button } from "@/components/ui/button";
import {
  DefenseAnswers,
  DefenseForm,
  DefenseFormField,
  formatDate,
  groupBySection,
  isMember,
} from "@/features/defense-requests/types";
import { Pencil } from "lucide-react";

interface AnswersSummaryProps {
  form: DefenseForm;
  answers: DefenseAnswers;
  /** Seções que não entram no resumo (ex.: as confirmações, mostradas à parte). */
  skipSections?: string[];
  /** Mostra "Editar" em cada seção (revisão no wizard). */
  onEditSection?: (section: string) => void;
  /** Esconde campos opcionais vazios. */
  hideEmptyOptional?: boolean;
}

/** Respostas de uma solicitação, agrupadas por seção, com os rótulos do formulário. */
export function AnswersSummary({ form, answers, skipSections = [], onEditSection, hideEmptyOptional = false }: AnswersSummaryProps) {
  const isEmpty = (field: DefenseFormField) => {
    const value = answers[field.key];
    return value === null || value === undefined || value === "" || value === false;
  };

  return (
    <div className="space-y-5">
      {groupBySection(form.fields)
        .filter(([section]) => !skipSections.includes(section))
        .map(([section, fields]) => {
          const shown = fields.filter((f) => !(hideEmptyOptional && !f.required && isEmpty(f)));
          return (
            <section key={section} className="space-y-2" aria-label={section}>
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{section}</h3>
                {onEditSection && (
                  <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => onEditSection(section)}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                )}
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {shown.map((field) => (
                  <div key={field.key} className={field.type === "textarea" || field.type === "confirm" ? "sm:col-span-2" : undefined}>
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    <dd className="whitespace-pre-wrap text-sm">
                      <AnswerValue field={field} value={answers[field.key]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
    </div>
  );
}

function AnswerValue({ field, value }: { field: DefenseFormField; value: DefenseAnswers[string] | undefined }) {
  if (field.type === "confirm") return <>{value ? "Sim" : "Não"}</>;
  if (field.type === "date") return <>{formatDate(value as string)}</>;
  if (field.type === "member") {
    if (!isMember(value)) return <>—</>;
    return (
      <span>
        <span className="font-medium">{value.name}</span>
        <span className="text-muted-foreground"> · {value.affiliation || "sem afiliação"}</span>
        {value.lattes && (
          <>
            {" · "}
            <a href={value.lattes} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">
              Lattes
            </a>
          </>
        )}
      </span>
    );
  }
  return <>{(value as string) || "—"}</>;
}
