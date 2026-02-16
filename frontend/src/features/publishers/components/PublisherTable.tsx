import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { Pencil, Trash2 } from "lucide-react";

interface PublisherTableProps {
  publishers: Publisher[];
  pagination: PaginatedResponse<Publisher> | null;
  isLoading: boolean;
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  onPageChange: (page: number) => void;
}

export function PublisherTable({
  publishers,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: PublisherTableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Qualis</TableHead>
            <TableHead className="w-25 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Carregando...
              </TableCell>
            </TableRow>
          ) : publishers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          ) : (
            publishers.map((publisher) => (
              <TableRow key={publisher.id}>
                <TableCell>
                  {publisher.publisher_type === 'journal'
                    ? (publisher.issn || '—')
                    : (publisher.initials || '—')}
                </TableCell>
                <TableCell className="capitalize">{publisher.name.toLowerCase()}</TableCell>
                <TableCell>
                  {publisher.publisher_type === 'journal' ? 'Periódico' :
                    publisher.publisher_type === 'conference' ? 'Conferência' :
                      publisher.publisher_type}
                </TableCell>
                <TableCell>
                  {publisher.stratum_qualis?.code || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(publisher)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(publisher)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Página {pagination.meta.current_page} de {pagination.meta.last_page}
          </span>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              disabled={pagination.meta.current_page === 1}
              onClick={() => onPageChange(1)}
            >
              {'<<'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={pagination.meta.current_page === 1}
              onClick={() => onPageChange(pagination.meta.current_page - 1)}
            >
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={pagination.meta.current_page === pagination.meta.last_page}
              onClick={() => onPageChange(pagination.meta.current_page + 1)}
            >
              Próxima
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              disabled={pagination.meta.current_page === pagination.meta.last_page}
              onClick={() => onPageChange(pagination.meta.last_page)}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
