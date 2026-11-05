import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DefenseRequest, formatDate, STATUS_LABEL } from "@/features/defense-requests/types";
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
}

export function DefenseRequestsTable({ requests, isLoading, onView, showSubmitter = false, emptyMessage }: DefenseRequestsTableProps) {
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
    columnHelper.display({ id: "advisor", header: "Orientador", cell: (info) => (info.row.original.answers.advisor as string) || "—" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as DefenseRequest["status"];
        return (
          <Badge variant="outline" className={status === "awaiting_advisor" ? "border-amber-500/50 text-amber-700 dark:text-amber-400" : "border-emerald-500/50 text-emerald-700 dark:text-emerald-400"}>
            {STATUS_LABEL[status]}
          </Badge>
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

  return <DataTable columns={columns} data={requests} isLoading={isLoading} emptyMessage={emptyMessage} />;
}
