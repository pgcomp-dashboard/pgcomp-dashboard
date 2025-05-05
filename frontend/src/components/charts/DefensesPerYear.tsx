import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { colorFromName } from '@/utils/color';

export default function DefensesPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'defenses_per_year', filter ],
    queryFn: () => api.defensesPerYear(filter),
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = Object.entries(data ?? {}).map(([ year, amount ]) => ({
    year,
    amount,
  }));

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          year: {
            label: 'Ano',
            color: 'hsl(var(--chart-2))',
          },
          amount: {
            label: 'Número',
            color: 'hsl(var(--chart-3))',
          },
        }}
        className="w-full h-[400px]"
      >
        <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            interval={0}
            angle={-45}
            textAnchor="end"
            tickFormatter={(name) =>
              name.length > 15 ? name.slice(0, 15) + '...' : name
            }
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top' }}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFromName(entry.year)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
