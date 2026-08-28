import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectDashboardSummaryCards } from '@/features/projects/components/ProjectDashboardSummaryCards';
import { ProjectDashboardTable } from '@/features/projects/components/ProjectDashboardTable';
import { useProjectDashboard } from '@/features/projects/hooks/useProjectDashboard';
import { cn } from '@/lib/utils';
import { Loader2, RotateCw } from 'lucide-react';

export default function ProjectDashboardPage() {
  const {
    summary,
    tableData,
    professors,
    isLoading,
    isFetching,
    filters,
    setFilters,
    years,
    refetch,
  } = useProjectDashboard();

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Carregando dashboard de projetos...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Projetos PGCOMP
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada dos projetos de pesquisa dos docentes.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Docente
          </Label>
          <Select
            value={filters.professorId?.toString() ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                professorId: value === 'all' ? null : parseInt(value),
              }))
            }
          >
            <SelectTrigger className="w-52 bg-background">
              <SelectValue placeholder="Todos os docentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os docentes</SelectItem>
              {professors.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Início
          </Label>
          <Select
            value={filters.startYear?.toString() ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                startYear: value === 'all' ? null : parseInt(value),
              }))
            }
          >
            <SelectTrigger className="w-32 bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Fim
          </Label>
          <Select
            value={filters.endYear?.toString() ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                endYear: value === 'all' ? null : parseInt(value),
              }))
            }
          >
            <SelectTrigger className="w-32 bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Status
          </Label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value === 'all' ? null : value,
              }))
            }
          >
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar"
            className="bg-background hover:bg-muted"
          >
            <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>

          {isFetching && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Atualizando...
            </span>
          )}
        </div>
      </div>

      <ProjectDashboardSummaryCards summary={summary} isLoading={isLoading} />

      <ProjectDashboardTable data={tableData} isLoading={isLoading} />
    </div>
  );
}