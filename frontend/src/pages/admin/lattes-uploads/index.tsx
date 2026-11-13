import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLattesUploads } from '@/features/admin-lattes/hooks/useLattesUploads';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Search } from 'lucide-react';

export default function LattesUploadsPage() {
  const {
    uploads,
    isLoading,
    isFetching,
    isError,
    page,
    setPage,
    perPage,
    setPerPage,
    searchTerm,
    setSearchTerm,
    handleDownload,
    refresh,
    meta,
  } = useLattesUploads();

  if (isError) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
        <p className="font-medium">Erro ao carregar uploads.</p>
        <Button variant="outline" className="mt-4" onClick={() => refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Arquivos XML Lattes
        </h1>
        <p className="text-muted-foreground mt-1">
          Lista de currículos Lattes enviados pelos docentes para conferência.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            Por página
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => {
              setPerPage(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[ 15, 30, 50, 100 ].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refresh()}
            disabled={isFetching}
            aria-label="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Docente</TableHead>
              <TableHead>Último Envio</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : uploads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum arquivo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              uploads.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    {user.lattes_xml_uploaded_at ? (
                      new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                        .format(new Date(user.lattes_xml_uploaded_at))
                        .replace(',', ' às')
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(user.id, user.name)}
                      className="hover:text-primary transition-colors"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar XML
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {meta?.total
            ? `Exibindo ${meta.from}–${meta.to} de ${meta.total} docente${meta.total === 1 ? '' : 's'}${searchTerm.trim() ? ' encontrado(s)' : ' com arquivo enviado'}`
            : searchTerm.trim()
              ? 'Nenhum docente encontrado para esta busca.'
              : 'Nenhum docente com arquivo enviado.'}
        </p>
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((value) => value - 1)}
              disabled={page <= 1 || isFetching}
              title="Página anterior"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="whitespace-nowrap text-sm font-medium">
              Página {meta.current_page} de {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((value) => value + 1)}
              disabled={page >= meta.last_page || isFetching}
              title="Próxima página"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
