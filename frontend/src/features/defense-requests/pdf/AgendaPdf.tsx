import { DataTable } from "@/components/pdf/data-table/data-table";
import { Heading } from "@/components/pdf/heading/heading";
import { PageNumber } from "@/components/pdf/page-number/page-number";
import { Text } from "@/components/pdf/text/text";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import {
  DefenseRequest,
  formatDate,
  isMember,
} from "@/features/defense-requests/types";
import { pgcompPdfTheme } from "@/features/defense-requests/pdf/theme";
import { Document, Page } from "@formepdf/react";

type Row = {
  when: string;
  type: string;
  student: string;
  advisor: string;
  title: string;
  committee: string;
};

const committee = (r: DefenseRequest) =>
  Object.entries(r.answers)
    .filter(
      ([key, value]) =>
        (key.startsWith("member_") || key.startsWith("substitute_")) &&
        isMember(value) &&
        value.name,
    )
    .map(
      ([key, value]) =>
        `${isMember(value) ? value.name : ""}${key.startsWith("substitute_") ? " (supl.)" : ""}`,
    )
    .join("; ");

/** Pauta do colegiado: solicitações enviadas, em ordem de data da banca. */
export function AgendaPdf({
  requests,
  generatedAt = new Date(),
}: {
  requests: DefenseRequest[];
  generatedAt?: Date;
}) {
  // Por data e horário da banca; sem data vai para o fim da pauta.
  const when = (r: DefenseRequest) => (r.answers.date ? `${r.answers.date}${r.answers.time ?? ""}` : "~");
  const rows: Row[] = [...requests]
    .sort((a, b) => when(a).localeCompare(when(b)))
    .map((r) => ({
      when: `${formatDate(r.answers.date as string)} ${r.answers.time ?? ""}`.trim(),
      type: r.type_label,
      student: String(r.answers.student_name ?? "—"),
      advisor: r.advisor?.name ?? String(r.answers.advisor ?? "—"),
      title: String(r.answers.title ?? "—"),
      committee: committee(r) || "—",
    }));

  // O provider fica por fora: ele fixa o tema e devolve o próprio Document para o serializador.
  return (
    <PdfcnThemeProvider theme={pgcompPdfTheme}>
      <Document
        title="Pauta - solicitações de banca"
        author="PGCOMP - UFBA"
        lang="pt-BR"
      >
        <Page size={{ width: 841.89, height: 595.28 }} margin={36}>
          <Text variant="xs" color="#6b7280" noMargin>
            PGCOMP · UFBA
          </Text>
          <Heading level={2}>Pauta do colegiado: solicitações de banca</Heading>
          <Text variant="sm" color="#6b7280">
            {rows.length}{" "}
            {rows.length === 1
              ? "solicitação enviada"
              : "solicitações enviadas"}{" "}
            à coordenação · gerada em{" "}
            {generatedAt.toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
          <DataTable<Row>
            size="compact"
            stripe
            columns={[
              { key: "when", header: "Data", width: "11%" },
              { key: "type", header: "Tipo", width: "15%" },
              { key: "student", header: "Discente", width: "15%" },
              { key: "advisor", header: "Orientador(a)", width: "15%" },
              { key: "title", header: "Título", width: "22%" },
              { key: "committee", header: "Banca", width: "22%" },
            ]}
            data={rows}
          />
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
