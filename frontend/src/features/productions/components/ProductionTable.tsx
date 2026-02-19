import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Production } from '@/types/academic';
import { OnChangeFn, Row, SortingState } from '@tanstack/react-table';
import { SquarePenIcon, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { getProductionColumns } from './columns';

interface ProductionTableProps {
  isLoading: boolean;
  hasActiveFilters: boolean;
  productions: Production[];
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort: (key: any) => void;
  onEdit: (production: Production) => void;
  onDelete: (production: Production) => void;
  confirmDelete: (id: number) => void;
  selectedProduction?: Production;
  setProductionToDelete: (production: Production | undefined) => void;
}

export function ProductionTable({
  isLoading,
  hasActiveFilters,
  productions,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  confirmDelete,
  selectedProduction,
  setProductionToDelete,
}: ProductionTableProps) {
  const columns = useMemo(
    () =>
      getProductionColumns({
        onEdit,
        onDelete,
        confirmDelete,
        selectedProduction,
        setProductionToDelete,
      }),
    [onEdit, onDelete, confirmDelete, selectedProduction, setProductionToDelete]
  );

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: sortConfig.key,
        desc: sortConfig.direction === 'desc',
      },
    ],
    [sortConfig]
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;

    const firstSort = newSorting[0];
    if (firstSort) {
      onSort(firstSort.id);
    }
  };

  const renderMobileCard = (row: Row<Production>) => {
    const production = row.original;
    const qualis = production.publisher?.stratum_qualis;

    return (
      <div className="flex flex-col">
        <div className="p-3 bg-muted/30 border-b">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{production.title}</h3>
        </div>
        <div className="p-3">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground block">Local</span>
            <span className="font-medium text-sm capitalize">{production.publisher?.name.toLowerCase() || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Ano</span>
              <span className="font-medium">{production.year}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Tipo</span>
              <span className="font-medium">{production.publisher_type === 'journal' ? 'Revista' : 'Conferência'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Origem</span>
              <span className="font-medium capitalize">{production.source || 'NI'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Qualis / Pontos</span>
              <span className="font-medium">{qualis ? `${qualis.code} / ${qualis.score}` : 'NI'}</span>
            </div>
          </div>
        </div>

        <CardFooter className="flex border-t mt-auto items-stretch p-0">
          <Button variant="ghost" className="flex-1 rounded-none h-11 text-sm bg-transparent hover:bg-accent" onClick={() => onEdit(production)}>
            <SquarePenIcon className="h-4 w-4 mr-2" /> Editar
          </Button>
          <div className="w-px bg-border" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="flex-1 rounded-none h-11 text-sm text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(production)}>
                <Trash className="h-4 w-4 mr-2" /> Deletar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogOverlay />
              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-auto">
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Essa ação não pode ser desfeita. Isso vai permanentemente deletar a produção.
                </AlertDialogDescription>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                  <AlertDialogCancel asChild>
                    <Button variant="outline" onClick={() => setProductionToDelete(undefined)}>Cancelar</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button className="bg-red-500 hover:bg-red-600" onClick={() => selectedProduction && confirmDelete(selectedProduction.id)}>Deletar</Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
        </CardFooter>
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={productions}
      isLoading={isLoading}
      emptyMessage={
        hasActiveFilters
          ? 'Nenhuma produção encontrada com os filtros aplicados'
          : 'Não foram encontradas produções cadastradas para o usuário'
      }
      sorting={sorting}
      onSortingChange={handleSortingChange}
      manualSorting={true}
      renderMobileCard={renderMobileCard}
      getRowClassName={() => "align-top"}
    />
  );
}
