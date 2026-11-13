import { ErrorNotice } from "@/features/defense-requests/components/ErrorNotice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DefenseRequest, formatDate, STATUS_LABEL, STATUS_TONE } from "@/features/defense-requests/types";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Eye } from "lucide-react";

const columnHelper = createColumnHelper<DefenseRequest>();

interface DefenseRequestsTableProps {
  requests: DefenseRequest[];
  isLoading: boolean;
  onView: (request: DefenseRequest) => void;
  /** Coluna "Solicitado por" (visão da coordenação). */
  showSubmitter?: boolean;
  emptyMessage: string;
  /** Falha ao carregar: mostra o erro com "Tentar de novo" em vez de "nenhuma solicitação". */
  isError?: boolean;
  onRetry?: () => void;
}

export function DefenseRequestsTable({ requests, isLoading, onView, showSubmitter = false, emptyMessage, isError, onRetry }: DefenseRequestsTableProps) {
  const columns: ColumnDef<DefenseRequest, any>[] = [
    columnHelper.accessor("type_label", { header: "Tipo", cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
    columnHelper.display({ id: "student", header: "Aluno", cell: (info) => (info.row.original.answers.student_name as string) ?? "—" }),
    columnHelper.display({
      id: "when",
      header: "Data e horário",
      cell: (info) => (
        <span className="whitespace-nowrap">
          {formatDate(info.row.original.answers.date as string)} {(info.row.original.answers.time as string) ?? ""}
        </span>
      ),
    }),
    ...(showSubmitter
      ? [columnHelper.display({ id: "submitter", header: "Aberta por", cell: (info) => info.row.original.submitted_by?.name ?? "—" })]
      : []),
    // Aguardando: o orientador atual do cadastro (a API resolve); enviada: quem enviou.
    columnHelper.display({
      id: "advisor",
      header: "Orientador",
      cell: (info) => info.row.original.advisor?.name ?? ((info.row.original.answers.advisor as string) || "—"),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as DefenseRequest["status"];
        return (
          <span className="flex flex-wrap gap-1">
            <Badge variant="outline" className={STATUS_TONE[status]}>
              {STATUS_LABEL[status]}
            </Badge>
            {info.row.original.archived_at && (
              <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                Arquivada
              </Badge>
            )}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "view",
      header: "Ver",
      cell: (info) => (
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ver solicitação" onClick={() => onView(info.row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  if (isError && requests.length === 0) {
    return (
      <ErrorNotice
        title="Não foi possível carregar as solicitações."
        actions={
          onRetry && (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Tentar de novo
            </Button>
          )
        }
      >
        <p className="text-muted-foreground">Verifique sua conexão. Se continuar, avise a secretaria do PGCOMP.</p>
      </ErrorNotice>
    );
  }
  return <DataTable columns={columns} data={requests} isLoading={isLoading} emptyMessage={emptyMessage} />;
}
