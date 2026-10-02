import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAwardsDashboard } from "@/features/awards/hooks/useAwards";
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

export function AwardsDashboard() {
  const [year, setYear] = useState<string>("all");
  const { data, isLoading, isError } = useAwardsDashboard(
    year === "all" ? undefined : Number(year),
  );

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Ano
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
          <h2 className="font-semibold mb-4">Prêmios por categoria</h2>
          {data.per_category.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prêmio no período.</p>
          ) : (
            <div style={{ height: Math.max(288, data.per_category.length * 36 + 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.per_category} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} interval={0} />
                  <Tooltip />
                  <Bar dataKey="total" name="Prêmios" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
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
                  <Bar dataKey="total" name="Prêmios" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
