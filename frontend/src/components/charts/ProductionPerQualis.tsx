import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import api from '@/services/api';
import { colorFromName } from '@/utils/color.ts';

// 👇 Importando suporte à expansão com scroll
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';

const MAX_VISIBLE_BARS = 15;

export default function ProductionPerQualisChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [ , setChartHeight ] = useState<number>(0);

  useEffect(() => {
    if (chartRef.current) {
      setChartHeight(chartRef.current.clientHeight);
    }
  }, []);

  const { data: response, isLoading, error } = useQuery({
    queryKey: [ 'productionPerQualis' ],
    queryFn: () => api.productionPerQualis(),
  });

  const years: number[] = Array.isArray(response?.years) ? response.years : [];
  const data: { label: string; data: number[] }[] = Array.isArray(response?.data)
    ? response.data
    : [];

  // Hook de controle de expansão (antes do return)
  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart(years.length, MAX_VISIBLE_BARS);
  const marginBottom = isScrollable ? 'mb-24' : 'mb-16';

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

  const allQualis = data.map((d) => d.label);

  return (
    <>
      {/* Mostrar botão apenas se houver mais do que o máximo visível */}
      {years.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      {/* Div com scroll horizontal e largura mínima dinâmica */}
      <div
        className={`block w-full overflow-x-auto pb-4 ${marginBottom}`}
        style={{ minHeight: '400px' }}
      >
        <div style={{ minWidth: chartWidth }} ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 18 }} />
              <YAxis tick={{ fontSize: 18 }} />
              <Legend wrapperStyle={{ fontSize: 18 }} />
              <Tooltip />
              {allQualis.map((qualis) => (
                <Bar
                  key={qualis}
                  dataKey={qualis}
                  stackId="a"
                  fill={colorFromName(qualis)}
                  stroke="#ffffff"
                >
                  {/* Exibir valor de cada qualis no centro da barra */}
                  <LabelList
                    dataKey={qualis}
                    position="center"
                    content={({ x, y, width, height, value }) => {
                      const numX = Number(x);
                      const numY = Number(y);
                      const numWidth = Number(width);
                      const numHeight = Number(height);

                      return (
                        <text
                          x={numX + numWidth / 2}
                          y={numY + numHeight / 2}
                          fill="#fff"
                          fontSize={12}
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
      </div>
    </>
  );
}
