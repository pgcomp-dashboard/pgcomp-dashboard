import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAwardsDashboard } from '@/features/awards/hooks/useAwards';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BAR_COLOR = "#2563eb";
const MAX_VISIBLE_BARS = 12;

interface ChartEntry {
  name: string;
  total: number;
  groupedNames?: string[];
  groupedCount?: number;
}

function withOthers<T extends ChartEntry>(
  entries: T[],
  expanded: boolean,
): (T | ChartEntry)[] {
  if (expanded || entries.length <= MAX_VISIBLE_BARS) return entries;

  const visibleCount = MAX_VISIBLE_BARS - 1;
  const visibleEntries = entries.slice(0, visibleCount);
  const hiddenEntries = entries.slice(visibleCount);

  return [
    ...visibleEntries,
    {
      name: `Outros (${hiddenEntries.length})`,
      total: hiddenEntries.reduce((sum, entry) => sum + entry.total, 0),
      groupedNames: hiddenEntries.flatMap((entry) => entry.groupedNames ?? [ entry.name ]),
      groupedCount: hiddenEntries.length,
    },
  ];
}

function normalizeCategoryName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function groupSimilarCategories(
  categories: { name: string; total: number }[],
): { name: string; total: number; groupedNames: string[] }[] {
  const grouped = new Map<
    string,
    { name: string; total: number; groupedNames: string[] }
  >();

  categories.forEach(({ name, total }) => {
    const baseName = name.replace(
      /^\s*\d+(?:st|nd|rd|th|º|ª)\s+(?:lugar\s+)?/i,
      '',
    );
    const normalizedName = normalizeCategoryName(baseName);
    let key = normalizedName;
    let label = baseName.trim();

    if (normalizedName.includes('ctd')) {
      key = 'ctd';
      label = 'Concurso de Teses e Dissertações (CTD)';
    } else if (
      normalizedName.includes('concurso') &&
      normalizedName.includes('iniciacao cientifica')
    ) {
      key = 'concurso-iniciacao-cientifica';
      label = 'Concurso de Iniciação Científica';
    } else if (
      [ 'melhor revisor', 'revisor destaque', 'outstand reviwer' ].includes(
        normalizedName,
      )
    ) {
      key = 'revisor';
      label = 'Reconhecimento como revisor';
    } else if (
      [ 'keynote speaker', 'palestrante convidado' ].includes(normalizedName)
    ) {
      key = 'palestrante-convidado';
      label = 'Palestrante convidado (Keynote)';
    }

    const current = grouped.get(key);
    if (current) {
      current.total += total;
      current.groupedNames.push(name);
    } else {
      grouped.set(key, { name: label, total, groupedNames: [ name ] });
    }
  });

  return [ ...grouped.values() ].sort(
    (left, right) =>
      right.total - left.total || left.name.localeCompare(right.name),
  );
}

interface AwardsDashboardProps {
  years: number[];
  selectedYears: Set<number> | null;
  onYearChange: (year: number, checked: boolean) => void;
  onSelectAllYears: (checked: boolean) => void;
}

export function AwardsDashboard({
  years,
  selectedYears,
  onYearChange,
  onSelectAllYears,
}: AwardsDashboardProps) {
  const selectedYearsList =
    selectedYears === null ? undefined : [ ...selectedYears ].sort();
  const { data, isLoading, isError } = useAwardsDashboard(selectedYearsList);
  const [ showAllCategories, setShowAllCategories ] = useState(false);
  const [ expandedRecipients, setExpandedRecipients ] = useState<Record<string, boolean>>({});

  if (isLoading && !data) {
    return <p className="text-muted-foreground">Carregando dashboard de prêmios...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar o dashboard de prêmios.</p>;
  }

  const cards = [
    { label: "Total de prêmios", value: data.total },
    { label: "Docentes premiados", value: data.by_recipient_type.professor },
    { label: "Discentes premiados", value: data.by_recipient_type.student },
    { label: "Técnicos premiados", value: data.by_recipient_type.staff },
    { label: "Nacionais", value: data.by_scope.national },
    { label: "Internacionais", value: data.by_scope.international },
  ];
  const categories = groupSimilarCategories(data.per_category);
  const displayedCategories = withOthers(categories, showAllCategories);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-lg border">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filtrar prêmios por ano
          </legend>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="award-dashboard-year-all"
                checked={selectedYears === null}
                onCheckedChange={(checked) => onSelectAllYears(checked === true)}
              />
              <Label
                htmlFor="award-dashboard-year-all"
                className="cursor-pointer"
              >
                Todos
              </Label>
            </div>
            {years.map((year) => (
              <div key={year} className="flex items-center gap-2">
                <Checkbox
                  id={`award-dashboard-year-${year}`}
                  checked={selectedYears === null || selectedYears.has(year)}
                  onCheckedChange={(checked) =>
                    onYearChange(year, checked === true)
                  }
                />
                <Label
                  htmlFor={`award-dashboard-year-${year}`}
                  className="cursor-pointer"
                >
                  {year}
                </Label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-muted/40 border rounded-lg p-4 flex flex-col gap-1"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {card.label}
            </span>
            <span className="font-bold text-2xl" data-testid="award-card-value">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="border rounded-lg p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Prêmios por categoria</h2>
            {categories.length > MAX_VISIBLE_BARS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAllCategories((expanded) => !expanded)}
              >
                {showAllCategories
                  ? 'Mostrar menos'
                  : `Expandir (${categories.length} categorias)`}
              </Button>
            )}
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prêmio no período.</p>
          ) : (
            <div style={{ height: Math.max(288, displayedCategories.length * 40 + 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayedCategories} layout="vertical" margin={{ left: 8, right: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} interval={0} />
                  <Tooltip
                    labelFormatter={(_, payload) => {
                      const entry = payload[0]?.payload as ChartEntry | undefined;
                      if (entry?.groupedCount) {
                        return `Outras ${entry.groupedCount} categorias: ${entry.groupedNames?.join(', ') ?? ''}`;
                      }
                      return entry?.groupedNames?.join(', ') ?? '';
                    }}
                  />
                  <Bar dataKey="total" name="Prêmios" fill={BAR_COLOR} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="total" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Prêmios por ano</h2>
          {data.per_year.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prêmio cadastrado.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.per_year} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Prêmios" fill={BAR_COLOR} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Prêmios nacionais e internacionais por ano</h2>
          {data.per_year_by_scope.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prêmio cadastrado.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.per_year_by_scope} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="national" name="Nacionais" fill="#2563eb">
                    <LabelList dataKey="national" position="top" />
                  </Bar>
                  <Bar dataKey="international" name="Internacionais" fill="#16a34a">
                    <LabelList dataKey="international" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {[
          {
            title: "Prêmios por docente",
            data: data.awards_by_professor,
            color: "#7c3aed",
            emptyMessage: "Nenhum docente premiado no período.",
          },
          {
            title: "Prêmios por discente",
            data: data.awards_by_student,
            color: "#ea580c",
            emptyMessage: "Nenhum discente premiado no período.",
          },
        ].map((chart) => {
          const expanded = expandedRecipients[chart.title] ?? false;
          const displayedData = withOthers(chart.data, expanded);

          return (
            <section key={chart.title} className="border rounded-lg p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{chart.title}</h2>
                {chart.data.length > MAX_VISIBLE_BARS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setExpandedRecipients((current) => ({
                        ...current,
                        [chart.title]: !expanded,
                      }))
                    }
                  >
                    {expanded
                      ? 'Mostrar menos'
                      : `Expandir (${chart.data.length} pessoas)`}
                  </Button>
                )}
              </div>
              {chart.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">{chart.emptyMessage}</p>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ width: Math.max(640, displayedData.length * 80), height: 380 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayedData} margin={{ bottom: 72, left: -16, top: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          angle={-40}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="total" name="Quantidade de prêmios" fill={chart.color}>
                          <LabelList dataKey="total" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
