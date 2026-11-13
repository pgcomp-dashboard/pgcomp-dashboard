import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  dashboardService,
  QualisProductionStatistics,
} from '@/services/modules/dashboard.service';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ChevronDown, FileText, Users } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

function formatNumber(value: number | null) {
  return value === null ? '—' : numberFormatter.format(value);
}

function StatisticsTable({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="border-b bg-muted/30 px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="px-2 sm:px-4">
        <Table>{children}</Table>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="rounded-lg bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {numberFormatter.format(value)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function QualisTable({
  title,
  rows,
}: {
  title: string;
  rows: QualisProductionStatistics[];
}) {
  return (
    <StatisticsTable title={title}>
      <TableHeader>
        <TableRow>
          <TableHead className="h-11 text-left text-xs uppercase tracking-wide text-muted-foreground">Qualis</TableHead>
          <TableHead className="h-11 text-right text-xs uppercase tracking-wide text-muted-foreground">Total</TableHead>
          <TableHead className="h-11 text-right text-xs uppercase tracking-wide text-muted-foreground">Percentual</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.qualis} className="odd:bg-muted/20">
            <TableCell className="text-left">
              <Badge variant={row.qualis === 'NI' ? 'outline' : 'secondary'}>
                {row.qualis}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">{row.total}</TableCell>
            <TableCell className="text-right tabular-nums">
              <div className="inline-flex min-w-24 items-center justify-end gap-2">
                <span>{formatNumber(row.percentage)}%</span>
                <span
                  className="h-1.5 w-12 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${row.percentage}%` }}
                  />
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StatisticsTable>
  );
}

export function ProductionStatistics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: [ 'production-statistics' ],
    queryFn: dashboardService.productionStatistics,
  });

  if (isLoading) {
    return <p className="py-8 text-center text-muted-foreground">Carregando estatísticas...</p>;
  }

  if (isError || !data) {
    return (
      <p role="alert" className="py-8 text-center text-destructive">
        Não foi possível carregar as estatísticas de produções. Tente novamente.
      </p>
    );
  }

  const summaryRows = [
    [ 'Média por docente', data.faculty_summary.mean ],
    [ 'Mediana', data.faculty_summary.median ],
    [ 'Desvio padrão populacional', data.faculty_summary.standard_deviation ],
    [ 'Mínimo', data.faculty_summary.minimum ],
    [ 'Máximo', data.faculty_summary.maximum ],
  ] as const;
  const facultyWithProductions = data.faculty.filter(
    (professor) => professor.total > 0,
  ).length;
  const facultyCount = data.faculty_summary.faculty_count;

  return (
    <div className="space-y-6">
      <p className="rounded-lg border bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        As estatísticas consideram todos os docentes cadastrados, incluindo quem
        não possui produções (contagem zero). Cada produção em coautoria conta
        uma vez para cada docente. Percentuais Qualis usam como denominador o
        total de produções daquele tipo; produções sem classificação aparecem
        como NI.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Docentes com produções cadastradas"
          value={facultyWithProductions}
          detail={`de ${numberFormatter.format(facultyCount)} docentes`}
          icon={Users}
        />
        <MetricCard
          label="Produções cadastradas"
          value={data.productions_per_year.reduce((total, item) => total + item.total, 0)}
          detail="Total de registros em todos os anos"
          icon={FileText}
        />
      </div>

      <StatisticsTable
        title="Resumo da produção por docente"
        description="Medidas calculadas considerando também docentes com zero produções."
      >
        <TableBody>
          {summaryRows.map(([ label, value ]) => (
            <TableRow key={label} className="odd:bg-muted/20">
              <TableCell className="text-left font-medium">{label}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{formatNumber(value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StatisticsTable>

      <Collapsible>
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Produções por docente</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Lista detalhada de {numberFormatter.format(data.faculty.length)} docentes.
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="group shrink-0">
                <span>Ver lista</span>
                <ChevronDown
                  className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="max-h-[28rem] overflow-auto border-t px-2 sm:px-4">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="h-11 text-left text-xs uppercase tracking-wide text-muted-foreground">Docente</TableHead>
                    <TableHead className="h-11 text-right text-xs uppercase tracking-wide text-muted-foreground">Produções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.faculty.map((professor) => (
                    <TableRow key={professor.id} className="odd:bg-muted/20">
                      <TableCell className="text-left">{professor.name}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{professor.total}</TableCell>
                    </TableRow>
                  ))}
                  {data.faculty.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                        Nenhum docente cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <QualisTable
        title="Conferências por Qualis"
        rows={data.conferences_by_qualis}
      />

      <QualisTable
        title="Periódicos por Qualis"
        rows={data.journals_by_qualis}
      />

      <StatisticsTable title="Produções por ano">
        <TableHeader>
          <TableRow>
            <TableHead className="h-11 text-left text-xs uppercase tracking-wide text-muted-foreground">Ano</TableHead>
            <TableHead className="h-11 text-right text-xs uppercase tracking-wide text-muted-foreground">Total de produções</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.productions_per_year.map((row) => (
            <TableRow key={row.year} className="odd:bg-muted/20">
              <TableCell className="text-left">{row.year}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{row.total}</TableCell>
            </TableRow>
          ))}
          {data.productions_per_year.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                Nenhuma produção cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </StatisticsTable>
    </div>
  );
}
