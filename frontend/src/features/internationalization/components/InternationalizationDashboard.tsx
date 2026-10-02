import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInternationalizationDashboard } from "@/features/internationalization/hooks/useInternationalization";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BAR_COLOR = "#2563eb";

function HorizontalBars({ data }: { data: { name: string; total: number }[] }) {
  return (
    <div style={{ height: Math.max(288, data.length * 36 + 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} interval={0} />
          <Tooltip />
          <Bar dataKey="total" name="Ações" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InternationalizationDashboard() {
  const [year, setYear] = useState<string>("all");
  const { data, isLoading, isError } = useInternationalizationDashboard(
    year === "all" ? undefined : Number(year),
  );

  if (isLoading && !data) {
    return <p className="text-muted-foreground">Carregando dashboard de internacionalização...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar o dashboard de internacionalização.</p>;
  }

  const cards = [
    { label: "Total de ações", value: data.total },
    { label: "Docentes", value: data.by_level.professor },
    { label: "Discentes", value: data.by_level.student },
    { label: "No Lattes", value: data.by_lattes_status.registered },
    { label: "Lattes pendente", value: data.by_lattes_status.pending },
    { label: "Países", value: data.countries_count },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Ano de início
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-40 bg-background" aria-label="Filtrar por ano">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {data.years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-muted/40 border rounded-lg p-4 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {card.label}
            </span>
            <span className="font-bold text-2xl" data-testid="intl-card-value">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Ações por categoria</h2>
          {data.per_category.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ação no período.</p>
          ) : (
            <HorizontalBars data={data.per_category} />
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Ações por ano</h2>
          {data.per_year.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ação cadastrada.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.per_year} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Ações" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="border rounded-lg p-4 xl:col-span-2">
          <h2 className="font-semibold mb-4">Principais países</h2>
          {data.per_country.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum país informado no período.</p>
          ) : (
            <HorizontalBars data={data.per_country} />
          )}
        </section>
      </div>
    </div>
  );
}
