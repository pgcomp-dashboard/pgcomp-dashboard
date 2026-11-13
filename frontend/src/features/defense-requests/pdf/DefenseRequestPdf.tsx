import { Divider } from "@/components/pdf/divider/divider";
import { Heading } from "@/components/pdf/heading/heading";
import { KeyValue } from "@/components/pdf/key-value/key-value";
import { PageNumber } from "@/components/pdf/page-number/page-number";
import { Section } from "@/components/pdf/section/section";
import { Text } from "@/components/pdf/text/text";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import {
  DefenseAnswers,
  DefenseForm,
  DefenseFormField,
  DefenseRequest,
  formatDate,
  groupBySection,
  isMember,
  STATUS_LABEL,
} from "@/features/defense-requests/types";
import { pgcompPdfTheme } from "@/features/defense-requests/pdf/theme";
import { Document, Page } from "@formepdf/react";

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

export function answerText(
  field: DefenseFormField,
  value: DefenseAnswers[string] | undefined,
): string {
  if (field.type === "confirm") return value ? "Sim" : "Não";
  if (field.type === "date") return formatDate(value as string);
  if (field.type === "member") {
    if (!isMember(value)) return "—";
    return [value.name, value.affiliation || "sem afiliação", value.lattes]
      .filter(Boolean)
      .join(" · ");
  }
  return typeof value === "string" && value.trim() ? value : "—";
}

/** PDF de uma solicitação: situação e todas as respostas, na ordem do formulário. */
export function DefenseRequestPdf({
  request,
  form,
}: {
  request: DefenseRequest;
  form: DefenseForm;
}) {
  const answers = request.answers;
  // O provider fica por fora: ele fixa o tema e devolve o próprio Document para o serializador.
  return (
    <PdfcnThemeProvider theme={pgcompPdfTheme}>
      <Document
        title={`${request.type_label} - ${answers.student_name ?? ""}`}
        author="PGCOMP - UFBA"
        lang="pt-BR"
      >
        <Page size="A4" margin={48}>
          <Text variant="xs" color="#6b7280" noMargin>
            PGCOMP · UFBA · Solicitação de banca
          </Text>
          <Heading level={1}>{request.type_label}</Heading>
          <KeyValue
            divided
            size="sm"
            items={[
              { key: "Discente", value: String(answers.student_name ?? "—") },
              {
                key: "Orientador(a)",
                value: request.advisor?.name ?? String(answers.advisor ?? "—"),
              },
              {
                key: "Situação",
                value: request.archived_at
                  ? `${STATUS_LABEL[request.status]} (arquivada)`
                  : STATUS_LABEL[request.status],
              },
              { key: "Aberta em", value: when(request.created_at) },
              {
                key: "Enviada à coordenação",
                value: when(request.submitted_at),
              },
            ]}
          />
          {groupBySection(form.fields).map(([section, fields]) => {
            const shown = fields.filter(
              (f) =>
                f.required ||
                !["", null, undefined, false].includes(answers[f.key] as never),
            );
            if (shown.length === 0) return null;
            return (
              <Section key={section} spacing="sm">
                <Heading level={3}>{section}</Heading>
                {shown.map((f) => (
                  // Cada resposta inteira na mesma página (rótulo e valor juntos).
                  <KeyValue
                    key={f.key}
                    direction="vertical"
                    size="sm"
                    noWrap
                    items={[
                      { key: f.label, value: answerText(f, answers[f.key]) },
                    ]}
                  />
                ))}
              </Section>
            );
          })}
          <Divider spacing="md" />
          <PageNumber
            format="Página {page} de {total}"
            align="right"
            size="xs"
            muted
            fixed
          />
        </Page>
      </Document>
    </PdfcnThemeProvider>
  );
}
