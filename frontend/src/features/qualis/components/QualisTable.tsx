import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { StratumQualis } from "@/types/academic";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { useMemo } from "react";

interface QualisTableProps {
  items: StratumQualis[];
  onEdit: (item: StratumQualis) => void;
  onDelete: (item: StratumQualis) => void;
}

const columnHelper = createColumnHelper<StratumQualis>();

export function QualisTable({ items, onEdit, onDelete }: QualisTableProps) {
  const columns = useMemo<ColumnDef<StratumQualis, any>[]>(
    () => [
      columnHelper.accessor("code", {
        header: "Código",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("score", {
        header: "Pontuação",
        cell: (info) => info.getValue().toFixed(1),
      }),
      columnHelper.accessor("updated_at", {
        header: "Atualizado",
        cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              aria-label="Editar"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 cursor-pointer hover:text-red-700"
              aria-label="Apagar"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  );

  const renderMobileCard = (row: Row<StratumQualis>) => {
    const item = row.original;
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Código</Label>
            <p className="font-medium">{item.code}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Pontuação</Label>
            <p className="font-medium">{item.score.toFixed(1)}</p>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Atualizado</Label>
          <p className="font-medium">
            {new Date(item.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <CardFooter className="flex justify-end gap-2 p-0 pt-2 mt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8"
          >
            <Pencil className="mr-2 h-3 w-3" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash className="mr-2 h-3 w-3" />
            Apagar
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={items}
      renderMobileCard={renderMobileCard}
      emptyMessage="Nenhum qualis encontrado."
    />
  );
}
