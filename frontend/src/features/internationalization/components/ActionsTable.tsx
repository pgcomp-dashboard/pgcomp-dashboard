import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  COURSE_LABEL,
  FILE_SLOT_LABEL,
  FILE_SLOTS,
  FileSlot,
  formatPeriod,
  InternationalizationAction,
  InternationalizationCategory,
  LEVEL_LABEL,
} from "@/features/internationalization/types";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { FileText, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

interface ActionsTableProps {
  actions: InternationalizationAction[];
  categories: InternationalizationCategory[];
  isLoading: boolean;
  onEdit: (action: InternationalizationAction) => void;
  onDelete: (action: InternationalizationAction) => void;
  onDownload: (action: InternationalizationAction, slot: FileSlot) => Promise<unknown>;
  /** Coluna "Cadastrado por" (visão da coordenação). */
  showSubmitter?: boolean;
  emptyMessage?: string;
}

const columnHelper = createColumnHelper<InternationalizationAction>();

export function ActionsTable({
  actions,
  categories,
  isLoading,
  onEdit,
  onDelete,
  onDownload,
  showSubmitter = false,
  emptyMessage = "Nenhuma ação cadastrada.",
}: ActionsTableProps) {
  const categoryName = (action: InternationalizationAction) =>
    action.category_name ?? categories.find((c) => c.id === action.category_id)?.name ?? "—";

  const download = (action: InternationalizationAction, slot: FileSlot) =>
    onDownload(action, slot).catch(() => toast.error("Não foi possível baixar o arquivo."));

  const columns = useMemo<ColumnDef<InternationalizationAction, any>[]>(
    () => [
      columnHelper.accessor("full_name", {
        header: "Pessoa",
        cell: (info) => <PersonCell action={info.row.original} />,
      }),
      columnHelper.display({
        id: "category",
        header: "Categoria",
        cell: (info) => categoryName(info.row.original),
      }),
      columnHelper.display({
        id: "abroad",
        header: "No exterior",
        cell: (info) => <AbroadCell action={info.row.original} />,
      }),
      columnHelper.display({
        id: "period",
        header: "Período",
        cell: (info) => <span className="whitespace-nowrap">{formatPeriod(info.row.original)}</span>,
      }),
      columnHelper.accessor("lattes_status", {
        header: "Lattes",
        cell: (info) =>
          info.getValue() === "registered" ? (
            <Badge variant="outline">Cadastrado</Badge>
          ) : (
            <Badge variant="secondary">Pendente</Badge>
          ),
      }),
      columnHelper.display({
        id: "files",
        header: "Arquivos",
        cell: (info) => <FilesCell action={info.row.original} onDownload={download} />,
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
              aria-label="Editar ação"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Excluir ação"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, onEdit, onDelete, onDownload, showSubmitter],
  );

  const renderMobileCard = (row: Row<InternationalizationAction>) => {
    const action = row.original;
    return (
      <div className="flex flex-col gap-3">
        <PersonCell action={action} />
        <div>
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <p>{categoryName(action)}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Período</Label>
          <p>{formatPeriod(action)}</p>
        </div>
        <AbroadCell action={action} />
        <FilesCell action={action} onDownload={download} />
        <CardFooter className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(action)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(action)}
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
      data={actions}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      renderMobileCard={renderMobileCard}
    />
  );
}

function PersonCell({ action }: { action: InternationalizationAction }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{action.full_name}</span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{LEVEL_LABEL[action.level]}</Badge>
        {action.level === "student" && (
          <span className="text-xs text-muted-foreground">{COURSE_LABEL[action.course]}</span>
        )}
      </div>
    </div>
  );
}

function AbroadCell({ action }: { action: InternationalizationAction }) {
  const parts = [action.country, action.institution].filter(Boolean);
  return <span>{parts.length > 0 ? parts.join(" · ") : "—"}</span>;
}

function FilesCell({
  action,
  onDownload,
}: {
  action: InternationalizationAction;
  onDownload: (action: InternationalizationAction, slot: FileSlot) => Promise<unknown>;
}) {
  const present = FILE_SLOTS.filter((slot) => action.files[slot]);
  if (present.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {present.map((slot) => (
        <Button
          key={slot}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={`${FILE_SLOT_LABEL[slot]}: ${action.files[slot]}`}
          aria-label={`Baixar ${FILE_SLOT_LABEL[slot]}: ${action.files[slot]}`}
          onClick={() => onDownload(action, slot)}
        >
          {slot === "document" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      ))}
    </div>
  );
}
