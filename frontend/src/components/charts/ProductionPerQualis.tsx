import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList, // Importando o LabelList
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import api from '@/services/api';
import { colorFromName } from '@/utils/color.ts';

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

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const years: number[] = Array.isArray(response?.years) ? response.years : [];
  const data: { label: string; data: number[] }[] = Array.isArray(response?.data)
    ? response.data
    : [];

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
    <div className="w-full h-[400px]" ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
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
                  // Garantir que x, y, width, height são números
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
  );
}
