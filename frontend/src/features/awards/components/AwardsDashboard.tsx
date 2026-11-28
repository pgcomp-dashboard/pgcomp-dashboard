import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAwardsDashboard } from "@/features/awards/hooks/useAwards";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BAR_COLOR = "#2563eb";
const MAX_VISIBLE_BARS = 12;

function awardCountDomain(dataMax: number): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) return 1;
  return Math.max(1, Math.ceil(dataMax * 1.12));
}

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
      groupedNames: hiddenEntries.flatMap(
        (entry) => entry.groupedNames ?? [entry.name],
      ),
      groupedCount: hiddenEntries.length,
    },
  ];
}

function normalizeCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
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
      "",
    );
    const normalizedName = normalizeCategoryName(baseName);
    let key = normalizedName;
    let label = baseName.trim();

    if (normalizedName.includes("ctd")) {
      key = "ctd";
      label = "Concurso de Teses e Dissertações (CTD)";
    } else if (
      normalizedName.includes("concurso") &&
      normalizedName.includes("iniciacao cientifica")
    ) {
      key = "concurso-iniciacao-cientifica";
      label = "Concurso de Iniciação Científica";
    } else if (
      ["melhor revisor", "revisor destaque", "outstand reviwer"].includes(
        normalizedName,
      )
    ) {
      key = "revisor";
      label = "Reconhecimento como revisor";
    } else if (
      ["keynote speaker", "palestrante convidado"].includes(normalizedName)
    ) {
      key = "palestrante-convidado";
      label = "Palestrante convidado (Keynote)";
    }

    const current = grouped.get(key);
    if (current) {
      current.total += total;
      current.groupedNames.push(name);
    } else {
      grouped.set(key, { name: label, total, groupedNames: [name] });
    }
  });

  return [...grouped.values()].sort(
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
    selectedYears === null ? undefined : [...selectedYears].sort();
  const { data, isLoading, isError } = useAwardsDashboard(selectedYearsList);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedRecipients, setExpandedRecipients] = useState<
    Record<string, boolean>
  >({});
  const isMobile = useIsMobile();

  if (isLoading && !data) {
    return (
      <p className="text-muted-foreground">
        Carregando dashboard de prêmios...
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-destructive">
        Não foi possível carregar o dashboard de prêmios.
      </p>
    );
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
                onCheckedChange={(checked) =>
                  onSelectAllYears(checked === true)
                }
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

      <div className="grid grid-cols-1 gap-6">
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
                  ? "Mostrar menos"
                  : `Expandir (${categories.length} categorias)`}
              </Button>
            )}
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio no período.
            </p>
          ) : (
            <div
              style={{
                height: Math.max(288, displayedCategories.length * 40 + 40),
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedCategories}
                  layout="vertical"
                  margin={{ top: 12, right: isMobile ? 48 : 56, bottom: 12, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    domain={[0, awardCountDomain]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={190}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <Tooltip
                    labelFormatter={(_, payload) => {
                      const entry = payload[0]?.payload as
                        | ChartEntry
                        | undefined;
                      if (entry?.groupedCount) {
                        return `Outras ${entry.groupedCount} categorias: ${entry.groupedNames?.join(", ") ?? ""}`;
                      }
                      return entry?.groupedNames?.join(", ") ?? "";
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name="Prêmios"
                    fill={BAR_COLOR}
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      dataKey="total"
                      position="right"
                      offset={8}
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 700,
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Prêmios por ano</h2>
          {data.per_year.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio cadastrado.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.per_year}
                  margin={{ top: 28, right: 16, bottom: 8, left: -16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} domain={[0, awardCountDomain]} />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    name="Prêmios"
                    fill={BAR_COLOR}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="total"
                      position="top"
                      offset={6}
                      style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">
            Prêmios nacionais e internacionais por ano
          </h2>
          {data.per_year_by_scope.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio cadastrado.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.per_year_by_scope}
                  margin={{ top: 28, right: 16, bottom: 8, left: -16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} domain={[0, awardCountDomain]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="national" name="Nacionais" fill="#2563eb">
                    <LabelList
                      dataKey="national"
                      position="top"
                      offset={6}
                      style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}
                    />
                  </Bar>
                  <Bar
                    dataKey="international"
                    name="Internacionais"
                    fill="#16a34a"
                  >
                    <LabelList
                      dataKey="international"
                      position="top"
                      offset={6}
                      style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {[
          {
            title: "Prêmios com discentes por ano",
            dataKey: "student_awards",
            name: "Prêmios com discentes",
            color: "#7c3aed",
            emptyMessage: "Nenhum prêmio com discente no período.",
          },
          {
            title: "Prêmios com docentes por ano",
            dataKey: "professor_awards",
            name: "Prêmios com docentes",
            color: "#2563eb",
            emptyMessage: "Nenhum prêmio com docente no período.",
          },
        ].map((chart) => (
          <section key={chart.title} className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4">{chart.title}</h2>
            {data.analysis_per_year.length === 0 ? (
              <p className="text-sm text-muted-foreground">{chart.emptyMessage}</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.analysis_per_year}
                    margin={{ top: 28, right: 16, bottom: 8, left: -16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} domain={[0, awardCountDomain]} />
                    <Tooltip
                      labelFormatter={(year) => `Ano ${year}`}
                      formatter={(value) => [value, chart.name]}
                    />
                    <Bar
                      dataKey={chart.dataKey}
                      name={chart.name}
                      fill={chart.color}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey={chart.dataKey}
                        position="top"
                        offset={6}
                        style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        ))}

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
                      ? "Mostrar menos"
                      : `Expandir (${chart.data.length} pessoas)`}
                  </Button>
                )}
              </div>
              {chart.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {chart.emptyMessage}
                </p>
              ) : (
                <div
                  className="w-full min-w-0"
                  style={{
                    height: Math.max(
                      isMobile ? 360 : 440,
                      displayedData.length * (isMobile ? 44 : 48) + 72,
                    ),
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayedData}
                      layout="vertical"
                      margin={{
                        top: 12,
                        right: isMobile ? 28 : 48,
                        bottom: 12,
                        left: isMobile ? 0 : 8,
                      }}
                      barCategoryGap="24%"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        domain={[0, awardCountDomain]}
                        tick={{ fontSize: isMobile ? 11 : 13 }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={isMobile ? 150 : 320}
                        interval={0}
                        tick={{ fontSize: isMobile ? 11 : 14, fontWeight: 500 }}
                        tickLine={false}
                        tickFormatter={(name: string) =>
                          isMobile && name.length > 18
                            ? `${name.slice(0, 17)}...`
                            : name
                        }
                      />
                      <Tooltip
                        formatter={(value) => [value, "Quantidade de prêmios"]}
                        labelFormatter={(label, payload) => {
                          const entry = payload[0]?.payload as
                            | ChartEntry
                            | undefined;
                          return entry?.groupedCount
                            ? `${label}: ${entry.groupedNames?.join(", ") ?? ""}`
                            : label;
                        }}
                      />
                      <Bar
                        dataKey="total"
                        name="Quantidade de prêmios"
                        fill={chart.color}
                        radius={[0, 6, 6, 0]}
                      >
                        <LabelList
                          dataKey="total"
                          position="right"
                          offset={10}
                          style={{
                            fontSize: isMobile ? 12 : 14,
                            fontWeight: 700,
                            fill: "currentColor",
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
