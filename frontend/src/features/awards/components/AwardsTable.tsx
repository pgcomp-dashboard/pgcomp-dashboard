import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Award,
  AwardCategory,
  RECIPIENT_TYPE_LABEL,
  SCOPE_LABEL,
} from "@/features/awards/types";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { Paperclip, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

interface AwardsTableProps {
  awards: Award[];
  categories: AwardCategory[];
  isLoading: boolean;
  onEdit: (award: Award) => void;
  onDelete: (award: Award) => void;
  onDownload: (award: Award) => Promise<unknown>;
  /** Coluna "Cadastrado por" (visão da coordenação). */
  showSubmitter?: boolean;
  emptyMessage?: string;
}

const columnHelper = createColumnHelper<Award>();

function WinnersList({ winners }: { winners: Award["winners"] }) {
  return (
    <ul className="flex flex-col gap-1">
      {winners.map((winner, index) => (
        <li key={`${winner.name}-${index}`} className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{winner.name}</span>
          <Badge variant="outline">{RECIPIENT_TYPE_LABEL[winner.recipient_type]}</Badge>
        </li>
      ))}
    </ul>
  );
}

export function AwardsTable({
  awards,
  categories,
  isLoading,
  onEdit,
  onDelete,
  onDownload,
  showSubmitter = false,
  emptyMessage = "Nenhum prêmio cadastrado.",
}: AwardsTableProps) {
  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const download = (award: Award) =>
    onDownload(award).catch(() => toast.error("Não foi possível baixar o anexo."));

  const columns = useMemo<ColumnDef<Award, any>[]>(
    () => [
      columnHelper.accessor("winners", {
        header: "Vencedor(es)",
        enableSorting: false,
        cell: (info) => <WinnersList winners={info.getValue()} />,
      }),
      columnHelper.accessor("scope", {
        header: "Abrangência",
        cell: (info) => SCOPE_LABEL[info.getValue() as Award["scope"]],
      }),
      columnHelper.accessor("category_id", {
        header: "Categoria",
        cell: (info) => categoryName(info.getValue()),
      }),
      columnHelper.accessor("year", {
        header: "Ano",
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor("attachment_name", {
        header: "Anexo",
        cell: (info) =>
          info.getValue() ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={info.getValue() ?? undefined}
              aria-label={`Baixar anexo ${info.getValue()}`}
              onClick={() => download(info.row.original)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          ) : null,
      }),
      ...(showSubmitter
        ? [
            columnHelper.display({
              id: "submitted_by",
              header: "Cadastrado por",
              cell: (info) => info.row.original.submitted_by?.name ?? "—",
            }),
          ]
        : []),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Editar prêmio"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Excluir prêmio"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, onEdit, onDelete, showSubmitter],
  );

  const renderMobileCard = (row: Row<Award>) => {
    const award = row.original;
    return (
      <div className="flex flex-col gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Vencedor(es)</Label>
          <WinnersList winners={award.winners} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <p>
            {categoryName(award.category_id)} · {award.year}
          </p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <p>{award.description}</p>
        </div>
        {award.attachment_name && (
          <Button variant="outline" onClick={() => download(award)}>
            <Paperclip className="h-4 w-4 mr-2" />
            {award.attachment_name}
          </Button>
        )}
        <CardFooter className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(award)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(award)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={awards}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      renderMobileCard={renderMobileCard}
    />
  );
}
