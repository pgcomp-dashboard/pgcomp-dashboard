import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { AwardCategory } from "@/features/awards/types";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface CategoriesTableProps {
  categories: AwardCategory[];
  isLoading: boolean;
  onEdit: (category: AwardCategory) => void;
  onDelete: (category: AwardCategory) => void;
}

const columnHelper = createColumnHelper<AwardCategory>();

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const columns = useMemo<ColumnDef<AwardCategory, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Categoria",
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      }),
      columnHelper.display({
        id: "count",
        header: "Prêmios",
        cell: (info) => (
          <div className="text-center">{info.row.original.awards_count ?? 0}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Editar categoria"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Excluir categoria"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  );

  const renderMobileCard = (row: Row<AwardCategory>) => {
    const category = row.original;
    return (
      <div className="flex flex-col gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <h3 className="font-semibold text-base">{category.name}</h3>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Prêmios</Label>
          <p className="font-medium">{category.awards_count ?? 0}</p>
        </div>
        <CardFooter className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
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
      data={categories}
      isLoading={isLoading}
      emptyMessage="Nenhuma categoria cadastrada."
      renderMobileCard={renderMobileCard}
    />
  );
}
