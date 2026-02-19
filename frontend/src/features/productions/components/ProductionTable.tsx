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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Production } from '@/types/academic';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  SquarePenIcon,
  Trash
} from 'lucide-react';
import { Link } from 'react-router';

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

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const TableSkeleton = () => (
    <>
      {[ ...Array(5) ].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-2 py-3"><Skeleton className="h-4 w-[90%]" /></TableCell>
          <TableCell className="px-2 py-3"><Skeleton className="h-4 w-[70%] mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const CardSkeleton = () => (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden mb-3">
      <div className="p-3 bg-muted/30 border-b">
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="p-3 space-y-4">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[ ...Array(4) ].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-8 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className="hidden md:block w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%] text-left px-2 py-2">Título</TableHead>
                <TableHead className="w-[20%] text-center px-2 py-2">Local</TableHead>
                <TableHead className="w-[8%] text-center px-1 py-2">Ano</TableHead>
                <TableHead className="w-[10%] text-center px-1 py-2">Tipo</TableHead>
                <TableHead className="w-[10%] text-center px-1 py-2">Origem</TableHead>
                <TableHead className="w-[8%] text-center px-1 py-2">Qualis</TableHead>
                <TableHead className="w-[8%] text-center px-1 py-2">Pts</TableHead>
                <TableHead className="w-[11%] text-center px-1 py-2">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton />
            </TableBody>
          </Table>
        </div>
        <div className="md:hidden flex flex-col gap-3 w-full">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    );
  }

  if (productions.length === 0) {
    return (
      <div className="w-full p-8 text-center border rounded-lg bg-muted/10 text-muted-foreground">
        {hasActiveFilters
          ? 'Nenhuma produção encontrada com os filtros aplicados'
          : 'Não foram encontradas produções cadastradas para o usuário'}
      </div>
    );
  }

  return (
    <>
      <div className="hidden w-full md:block rounded-md border max-h-[calc(100vh-350px)] overflow-y-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[25%] text-left px-2 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold" onClick={() => onSort('titulo')}>
                  Título <SortIcon column="titulo" />
                </Button>
              </TableHead>
              <TableHead className="w-[20%] text-center px-2 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold justify-center" onClick={() => onSort('local')}>
                  Local <SortIcon column="local" />
                </Button>
              </TableHead>
              <TableHead className="w-[8%] text-center px-1 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold" onClick={() => onSort('year')}>
                  Ano <SortIcon column="year" />
                </Button>
              </TableHead>
              <TableHead className="w-[10%] text-center px-1 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold" onClick={() => onSort('tipo')}>
                  Tipo <SortIcon column="tipo" />
                </Button>
              </TableHead>
              <TableHead className="w-[10%] text-center px-1 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold" onClick={() => onSort('origem')}>
                  Origem <SortIcon column="origem" />
                </Button>
              </TableHead>
              <TableHead className="w-[8%] text-center px-1 py-2">
                <span className="text-xs font-semibold">Qualis</span>
              </TableHead>
              <TableHead className="w-[8%] text-center px-1 py-2">
                <Button variant="ghost" size="sm" className="h-6 px-1 text-xs font-semibold" onClick={() => onSort('pontuacao')}>
                  Pts <SortIcon column="pontuacao" />
                </Button>
              </TableHead>
              <TableHead className="w-[11%] text-center px-1 py-2">
                <span className="text-xs font-semibold">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productions.map((production) => (
              <TableRow key={production.id}>
                <TableCell className="text-left px-2 py-2 align-top">
                  <Link
                    to={production.doi || production.home_page || '#'}
                    target={production.doi || production.home_page ? '_blank' : ''}
                    rel={production.doi || production.home_page ? 'noopener noreferrer' : undefined}
                  >
                    <div className="text-sm leading-snug whitespace-normal wrap-break-word text-justify" title={production.title}>
                      {production.title}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-center px-2 py-2 align-top">
                  <div className="text-sm leading-snug whitespace-normal wrap-break-word capitalize" title={production.publisher?.name || '--'}>
                    {production.publisher?.name.toLowerCase() || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="text-center px-1 py-2 text-sm">{production.year}</TableCell>
                <TableCell className="text-center px-1 py-2 text-sm">
                  {production.publisher_type === 'journal' ? 'Revista' : 'Conferência'}
                </TableCell>
                <TableCell className="text-center px-1 py-2 text-sm capitalize">
                  {production.source === 'xml' || production.source === 'lattes' ? 'Lattes' : production.source}
                </TableCell>
                <TableCell className="text-center px-1 py-2 text-sm">
                  {production.publisher?.stratum_qualis?.code || '--'}
                </TableCell>
                <TableCell className="text-center px-1 py-2 text-sm">
                  {production.publisher?.stratum_qualis?.score || '--'}
                </TableCell>
                <TableCell className="text-center px-1 py-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(production)} title="Editar">
                    <SquarePenIcon className="h-5 w-5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(production)} title="Deletar">
                        <Trash className="text-red-500 h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogPortal>
                      <AlertDialogOverlay />
                      <AlertDialogContent>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso vai permanentemente deletar a produção {selectedProduction?.title}.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-4">
                          <AlertDialogCancel asChild>
                            <Button className="bg-white text-black" onClick={() => setProductionToDelete(undefined)}>
                              Cancelar
                            </Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button className="bg-red-400 hover:bg-red-500" onClick={() => selectedProduction && confirmDelete(selectedProduction.id)}>
                              Sim, deletar produção
                            </Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialogPortal>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden flex flex-col gap-3 w-full">
        {productions.map((production) => {
          const qualis = production.publisher?.stratum_qualis;
          return (
            <div key={production.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
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
              <div className="flex border-t">
                <Button variant="ghost" className="flex-1 rounded-none h-11 text-sm" onClick={() => onEdit(production)}>
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
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
