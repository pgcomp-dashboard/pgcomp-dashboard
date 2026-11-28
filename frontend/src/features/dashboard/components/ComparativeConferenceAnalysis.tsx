import { useQuery } from "@tanstack/react-query";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/auth";
import { dashboardService } from "@/services/modules/dashboard.service";
import { useIsMobile } from "@/hooks/use-mobile";

type UniversityYear = {
  university: string;
  "2021": number;
  "2022": number;
  "2023": number;
  "2024": number;
};

type UniversityQualis = {
  university: string;
  total?: number;
  A1: number | null;
  A2: number | null;
  A3: number | null;
  A4: number | null;
  B1: number | null;
  B2: number | null;
  B3: number | null;
  B4: number | null;
  C: number | null;
  NA: number | null;
};

const SUCUPIRA_COMPARISON: UniversityYear[] = [
  { university: "PUC-Rio", "2021": 57, "2022": 47, "2023": 61, "2024": 86 },
  { university: "PUCRS", "2021": 83, "2022": 60, "2023": 70, "2024": 68 },
  { university: "UFRGS", "2021": 96, "2022": 85, "2023": 100, "2024": 116 },
  { university: "UNICAMP", "2021": 105, "2022": 93, "2023": 129, "2024": 132 },
  { university: "UFPA", "2021": 133, "2022": 79, "2023": 96, "2024": 137 },
  { university: "UFF", "2021": 109, "2022": 107, "2023": 158, "2024": 147 },
  { university: "UFMG", "2021": 168, "2022": 125, "2023": 125, "2024": 182 },
  { university: "USP-SC", "2021": 175, "2022": 143, "2023": 204, "2024": 215 },
];

const APOEMA_DOCTORATES: UniversityYear[] = [
  { university: "PUC-Rio", "2021": 15, "2022": 10, "2023": 6, "2024": 11 },
  { university: "PUCRS", "2021": 11, "2022": 8, "2023": 13, "2024": 11 },
  { university: "UFRGS", "2021": 14, "2022": 13, "2023": 17, "2024": 12 },
  { university: "UFF", "2021": 11, "2022": 10, "2023": 18, "2024": 19 },
  { university: "UNICAMP", "2021": 17, "2022": 20, "2023": 19, "2024": 21 },
  { university: "UFMG", "2021": 13, "2022": 20, "2023": 30, "2024": 15 },
  { university: "UFPE", "2021": 26, "2022": 49, "2023": 30, "2024": 39 },
  { university: "USP-SC", "2021": 39, "2022": 39, "2023": 38, "2024": 42 },
];

const YEAR_COLORS = {
  "2021": "#ef4444",
  "2022": "#84cc16",
  "2023": "#0ea5e9",
  "2024": "#a855f7",
};

const SUCUPIRA_QUALIS_2021: UniversityQualis[] = [
  { university: "PUCRS", A1: 27, A2: 37, A3: 31, A4: 26, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "PUC-Rio", A1: 64, A2: 31, A3: 73, A4: 7, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "UFRGS", A1: 113, A2: 90, A3: 39, A4: 34, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "UNICAMP", A1: 146, A2: 86, A3: 45, A4: 26, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "UFF", A1: 101, A2: 112, A3: 55, A4: 28, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "UFPE", A1: 177, A2: 113, A3: 56, A4: 64, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "UFMG", A1: 234, A2: 109, A3: 50, A4: 38, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
  { university: "USP-SC", A1: 300, A2: 120, A3: 59, A4: 54, B1: null, B2: null, B3: null, B4: null, C: null, NA: null },
];

const QUALIS_COLORS = {
  A1: "#ec4899",
  A2: "#e879f9",
  A3: "#818cf8",
  A4: "#38bdf8",
  B1: "#06b6d4",
  B2: "#10b981",
  B3: "#84cc16",
  B4: "#eab308",
  C: "#f97316",
  NA: "#fb7185",
};

const QUALIS_ORDER = [
  "A1",
  "A2",
  "A3",
  "A4",
  "B1",
  "B2",
  "B3",
  "B4",
  "C",
  "NA",
] as const;

const COMPARABLE_QUALIS = ["A1", "A2", "A3", "A4"] as const;

export default function ComparativeConferenceAnalysis() {
  const auth = useAuth();
  const isMobile = useIsMobile();
  const { data: pgcompByYear, isLoading, isError } = useQuery({
    queryKey: ["comparative-conference-pgcomp"],
    queryFn: () => dashboardService.totalProductionsPerYear("conference"),
    enabled: !!auth?.isAdmin,
  });

  const {
    data: pgcompQualis,
    isLoading: isLoadingQualis,
    isError: isErrorQualis,
  } = useQuery({
    queryKey: ["comparative-journal-qualis-pgcomp"],
    queryFn: () => dashboardService.productionPerQualis("journal"),
    enabled: !!auth?.isAdmin,
  });

  const {
    data: pgcompDefenses,
    isLoading: isLoadingDefenses,
    isError: isErrorDefenses,
  } = useQuery({
    queryKey: ["comparative-doctorates-pgcomp"],
    queryFn: () => dashboardService.defensesPerYear("doutorado"),
    enabled: !!auth?.isAdmin,
  });

  const pgcompRow: UniversityYear = {
    university: "PGCOMP/UFBA",
    "2021": pgcompByYear?.[2021] ?? 0,
    "2022": pgcompByYear?.[2022] ?? 0,
    "2023": pgcompByYear?.[2023] ?? 0,
    "2024": pgcompByYear?.[2024] ?? 0,
  };

  const chartData = [...SUCUPIRA_COMPARISON, pgcompRow];
  const pgcompDoctorateRow: UniversityYear = {
    university: "PGCOMP/UFBA",
    "2021": Array.isArray(pgcompDefenses)
      ? Number(pgcompDefenses.find((row) => row.year === 2021)?.doutorado ?? 0)
      : 0,
    "2022": Array.isArray(pgcompDefenses)
      ? Number(pgcompDefenses.find((row) => row.year === 2022)?.doutorado ?? 0)
      : 0,
    "2023": Array.isArray(pgcompDefenses)
      ? Number(pgcompDefenses.find((row) => row.year === 2023)?.doutorado ?? 0)
      : 0,
    "2024": Array.isArray(pgcompDefenses)
      ? Number(pgcompDefenses.find((row) => row.year === 2024)?.doutorado ?? 0)
      : 0,
  };
  const doctoratesChartData = [...APOEMA_DOCTORATES, pgcompDoctorateRow];
  const pgcompQualisTotals = QUALIS_ORDER.map((qualis) => {
    const sourceQualis = qualis === "NA" ? "NI" : qualis;
    const series = pgcompQualis?.data.find(
      (entry) => entry.label === sourceQualis,
    );
    const total = series?.data
      .filter((_, index) => {
        const year = pgcompQualis?.years[index];
        return year !== undefined && year >= 2021 && year <= 2024;
      })
      .reduce((sum, value) => sum + value, 0) ?? 0;

    return { qualis, total };
  });

  const pgcompQualisRow: UniversityQualis = {
    university: "PGCOMP/UFBA",
    A1: pgcompQualisTotals.find((row) => row.qualis === "A1")?.total ?? 0,
    A2: pgcompQualisTotals.find((row) => row.qualis === "A2")?.total ?? 0,
    A3: pgcompQualisTotals.find((row) => row.qualis === "A3")?.total ?? 0,
    A4: pgcompQualisTotals.find((row) => row.qualis === "A4")?.total ?? 0,
    B1: null,
    B2: null,
    B3: null,
    B4: null,
    C: null,
    NA: null,
  };
  const qualisChartData = [...SUCUPIRA_QUALIS_2021, pgcompQualisRow].sort(
    (left, right) => {
      const totalLeft = COMPARABLE_QUALIS.reduce(
          (sum, qualis) => sum + (left[qualis] ?? 0),
          0,
        );
      const totalRight = COMPARABLE_QUALIS.reduce(
          (sum, qualis) => sum + (right[qualis] ?? 0),
          0,
        );

      return (
        totalLeft - totalRight ||
        left.university.localeCompare(right.university, "pt-BR")
      );
    },
  ).map((row) => ({
    ...row,
    total: COMPARABLE_QUALIS.reduce(
      (sum, qualis) => sum + (row[qualis] ?? 0),
      0,
    ),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Artigos completos em conferências por ano</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparação entre programas selecionados pela análise APOEMA-PG/USP
            e o PGCOMP/UFBA.
            Os dados externos correspondem aos anos de 2021 a 2024.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando dados do PGCOMP...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os dados do PGCOMP.
            </p>
          ) : (
            <>
              <div className="h-[520px] w-full overflow-x-auto">
                <div className={isMobile ? "h-full min-w-[760px]" : "h-full w-full"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 30, right: 24, bottom: 100, left: 8 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="university"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: isMobile ? 11 : 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax + 20"]}
                        tick={{ fontSize: isMobile ? 11 : 12 }}
                      />
                      <Tooltip
                        formatter={(value, name) => [value, `Ano ${name}`]}
                      />
                      <Legend
                        formatter={(value) => `Ano ${value}`}
                        verticalAlign="top"
                      />
                      {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                        <Bar
                          key={year}
                          dataKey={year}
                          name={year}
                          fill={YEAR_COLORS[year]}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        >
                          <LabelList
                            dataKey={year}
                            position="top"
                            offset={5}
                            style={{ fontSize: 10, fontWeight: 700 }}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Programa / Universidade</th>
                      {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                        <th key={year} className="p-3 text-right">{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row) => (
                      <tr
                        key={row.university}
                        className="border-b last:border-0"
                      >
                        <th className="p-3 text-left font-medium">
                          {row.university}
                        </th>
                        {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                          <td key={year} className="p-3 text-right">
                            {row[year]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Fonte dos dados externos: análise da{" "}
                <a
                  className="underline"
                  href="https://sistemas.prpg.usp.br/apoema-pg/"
                  target="_blank"
                  rel="noreferrer"
                >
                  APOEMA-PG — USP
                </a>
                . Dados do PGCOMP obtidos das produções cadastradas neste sistema.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doutores formados por ano</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparação entre os programas selecionados e o PGCOMP/UFBA,
            nos anos de 2021 a 2024.
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingDefenses ? (
            <p className="text-sm text-muted-foreground">
              Carregando dados do PGCOMP...
            </p>
          ) : isErrorDefenses ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os dados de doutorados do PGCOMP.
            </p>
          ) : (
            <>
              <div className="h-[520px] w-full overflow-x-auto">
                <div className={isMobile ? "h-full min-w-[760px]" : "h-full w-full"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={doctoratesChartData}
                      margin={{ top: 30, right: 24, bottom: 100, left: 8 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="university"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: isMobile ? 11 : 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax + 5"]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value, name) => [value, `Ano ${name}`]}
                      />
                      <Legend
                        formatter={(value) => `Ano ${value}`}
                        verticalAlign="top"
                      />
                      {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                        <Bar
                          key={year}
                          dataKey={year}
                          name={year}
                          fill={YEAR_COLORS[year]}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        >
                          <LabelList
                            dataKey={year}
                            position="top"
                            offset={5}
                            style={{ fontSize: 10, fontWeight: 700 }}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Programa / Universidade</th>
                      {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                        <th key={year} className="p-3 text-right">{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {doctoratesChartData.map((row) => (
                      <tr key={row.university} className="border-b last:border-0">
                        <th className="p-3 text-left font-medium">
                          {row.university}
                        </th>
                        {(["2021", "2022", "2023", "2024"] as const).map((year) => (
                          <td key={year} className="p-3 text-right">
                            {row[year]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Fonte dos dados externos: análise da{" "}
                <a
                  className="underline"
                  href="https://sistemas.prpg.usp.br/apoema-pg/"
                  target="_blank"
                  rel="noreferrer"
                >
                  APOEMA-PG — USP
                </a>
                . Dados do PGCOMP obtidos das defesas cadastradas neste sistema.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicações em periódicos por Qualis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparação com dados externos do Sucupira classificados pelo
            Qualis divulgado em 2021. NA indica publicação em periódico não
            listado na classificação. O total comparável soma apenas A1–A4,
            os estratos confirmados em todas as séries.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[720px] w-full overflow-x-auto">
            <div className="h-full min-w-[1280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={qualisChartData}
                  margin={{ top: 48, right: 32, bottom: 128, left: 24 }}
                  barCategoryGap="18%"
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="university"
                    interval={0}
                    angle={-72}
                    textAnchor="end"
                    height={112}
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, "dataMax + 40"]}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Estrato",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 13, fontWeight: 600 },
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, `Estrato ${name}`]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingBottom: 18, fontSize: 13 }}
                  />
                  {QUALIS_ORDER.map((qualis) => (
                    <Bar
                      key={qualis}
                      dataKey={qualis}
                      name={qualis}
                      stackId="qualis"
                      fill={QUALIS_COLORS[qualis]}
                      maxBarSize={108}
                    >
                      <LabelList
                        dataKey={qualis}
                        position="inside"
                        content={({ x, y, width, height, value }) => {
                          if (!value || Number(value) === 0) return null;
                          if (
                            !["A1", "A2", "A3", "A4"].includes(qualis) &&
                            !(
                              qualis === "B1" &&
                              (Number(value) === 56 || Number(value) === 54)
                            ) &&
                            !(
                              qualis === "B2" &&
                              (Number(value) === 64)
                            ) &&
                            !(
                              qualis === "NA" &&
                              (Number(value) === 54 || Number(value) === 64)
                            )
                          ) {
                            return null;
                          }
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) + Number(height) / 2}
                              fill="#111827"
                              fontSize={10}
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {value}
                            </text>
                          );
                        }}
                        style={{ fontSize: 10, fontWeight: 700 }}
                      />
                      {qualis === "NA" && (
                        <LabelList
                          dataKey="total"
                          position="top"
                          offset={12}
                          content={({ x, y, width, value }) => {
                            if (!value) return null;
                            const label = String(value);
                            const boxWidth = label.length * 9 + 18;
                            const centerX = Number(x) + Number(width) / 2;
                            return (
                              <g>
                                <rect
                                  x={centerX - boxWidth / 2}
                                  y={Number(y) - 30}
                                  width={boxWidth}
                                  height={24}
                                  rx={8}
                                  fill="#ffffff"
                                  stroke="#d1d5db"
                                  strokeWidth={1}
                                />
                                <text
                                  x={centerX}
                                  y={Number(y) - 13}
                                  fill="#111827"
                                  fontSize={13}
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {label}
                                </text>
                              </g>
                            );
                          }}
                        />
                      )}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Programa / Universidade</th>
                  <th className="p-3 text-right">Total (A1–A4)</th>
                  {QUALIS_ORDER.map((qualis) => (
                    <th key={qualis} className="p-3 text-right">{qualis}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {qualisChartData.map((row) => (
                  <tr key={row.university} className="border-b last:border-0">
                    <th className="p-3 text-left font-medium">{row.university}</th>
                    <td className="p-3 text-right font-bold">{row.total}</td>
                    {QUALIS_ORDER.map((qualis) => (
                      <td key={qualis} className="p-3 text-right">
                        {row[qualis] === null || row[qualis] === 0
                          ? "—"
                          : row.university === "PGCOMP/UFBA"
                            ? row[qualis]
                            : ["B1", "B2", "B3", "B4", "C", "NA"].includes(qualis)
                              ? `~${row[qualis]}`
                              : row[qualis]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 font-semibold">PGCOMP/UFBA — periódicos por Qualis</h3>
          {isLoadingQualis ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Carregando dados do PGCOMP...
            </p>
          ) : isErrorQualis ? (
            <p className="mt-3 text-sm text-destructive">
              Não foi possível carregar os dados de periódicos do PGCOMP.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Estrato</th>
                    <th className="p-3 text-right">Quantidade (2021–2024)</th>
                  </tr>
                </thead>
                <tbody>
                  {pgcompQualisTotals.map((row) => (
                    <tr key={row.qualis} className="border-b last:border-0">
                      <th className="p-3 text-left font-medium">{row.qualis}</th>
                      <td className="p-3 text-right">
                        {row.total === 0 ? "—" : row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Fonte dos dados externos: análise da{" "}
            <a
              className="underline"
              href="https://sistemas.prpg.usp.br/apoema-pg/"
              target="_blank"
              rel="noreferrer"
            >
              APOEMA-PG — USP
            </a>
            , com dados base do{" "}
            <a
              className="underline"
              href="https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/envioColeta/dadosFotoEnvioColeta.jsf"
              target="_blank"
              rel="noreferrer"
            >
              Sucupira — Produção Intelectual
            </a>
            , com Qualis divulgado em 2021 para todas as áreas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
