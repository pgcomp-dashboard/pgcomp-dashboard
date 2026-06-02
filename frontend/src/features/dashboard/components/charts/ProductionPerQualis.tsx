import { colorFromName } from "@/utils/color.ts";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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

// 👇 Importando suporte à expansão com scroll
import ExpandChartButton from "@/components/ui/ExpandChartButton";
import { useExpandableChart } from "@/features/dashboard/hooks/useExpandableChart";
import useAuth from "@/hooks/auth";
import { dashboardService } from '@/services/modules/dashboard.service';
import ChartScrollWrapper from "./ChartScrollWrapper";

const MAX_VISIBLE_BARS = 15;

export default function ProductionPerQualisChart() {
  const auth = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);
  const [, setChartHeight] = useState<number>(0);

  useEffect(() => {
    if (chartRef.current) {
      setChartHeight(chartRef.current.clientHeight);
    }
  }, []);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["productionPerQualis"],
    queryFn: () => dashboardService.productionPerQualis(),
    enabled: !!auth?.isAdmin,
  });

  const years: number[] = Array.isArray(response?.years) ? response.years : [];
  const data: { label: string; data: number[] }[] = Array.isArray(
    response?.data,
  )
    ? response.data
    : [];

  // Hook de controle de expansão (antes do return)
  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } =
    useExpandableChart(years.length, MAX_VISIBLE_BARS);
  const marginBottom = isScrollable ? "mb-24" : "mb-16";

  // Tamanhos de fonte responsivos
  const fontSize = isMobile ? 11 : 18;
  const legendFontSize = isMobile ? 13 : 18;
  const labelFontSize = isMobile ? 10 : 16;

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  // Organize data for each year
  const chartData = years.map((year, index) => {
    const entry: Record<string, unknown> = { year };
    data.forEach(({ label, data }) => {
      entry[label] = data[index];
    });
    return entry;
  });

  const qualisOrder = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C", "NI"];
  const allQualis = qualisOrder.filter((q) => data.some((d) => d.label === q));
  const qualisForBars = [...allQualis].reverse(); // NI primeiro, A1 por cima

  return (
    <>
      {years.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      <ChartScrollWrapper
        minWidth={chartWidth}
        isScrollable={isScrollable}
        className={marginBottom}
      >
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize }} />
              <YAxis tick={{ fontSize }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const sorted = [...payload].reverse(); // A1 no topo
                    return (
                      <div className="bg-white p-3 border rounded text-sm">
                        <b>{label}</b>
                        {sorted.map((entry, i) => (
                          <div key={i} style={{ color: entry.fill }}>
                            {entry.dataKey} : {entry.value}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: legendFontSize }}
                payload={allQualis.map((qualis) => ({
                  value: qualis,
                  type: "square",
                  color: colorFromName(qualis),
                  id: qualis,
                }))}
              />
              {qualisForBars.map((qualis) => (
                <Bar
                  key={qualis}
                  dataKey={qualis}
                  stackId="a"
                  fill={colorFromName(qualis)}
                  stroke="#ffffff"
                >
                  <LabelList
                    dataKey={qualis}
                    position="center"
                    content={({ x, y, width, height, value }) => {
                      const numX = Number(x);
                      const numY = Number(y);
                      const numWidth = Number(width);
                      const numHeight = Number(height);
                      if (!value || Number(value) === 0) return null;
                      return (
                        <text
                          x={numX + numWidth / 2}
                          y={numY + numHeight / 2}
                          fill="#fff"
                          fontSize={labelFontSize}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartScrollWrapper>
    </>
  );
}