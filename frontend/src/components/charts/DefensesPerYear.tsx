import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  TooltipProps,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { ChartContainer } from '../ui/chart';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <div key={index}>
            <span className="tooltip-text">
              {ele.name} : {ele.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DefensesPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' | 'todas' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'defenses_per_year', filter ],
    queryFn: () => api.defensesPerYear(filter),
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  let chartData: { year: string; mestrado?: number; doutorado?: number }[] = [];

  if (filter === 'todas' || !filter) {
    chartData = Object.entries(data ?? {}).map(([ year, values ]) => {
    // Garantir que values seja tratado como objeto
      if (typeof values === 'object' && values !== null) {
        return {
          year,
          mestrado: (values as any).mestrado ?? 0,
          doutorado: (values as any).doutorado ?? 0,
        };
      }
      return { year, mestrado: 0, doutorado: 0 };
    });
  } else {
    chartData = Object.entries(data ?? {}).map(([ year, amount ]) => ({
      year,
      [filter]: amount as number,
    }));
  }

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          year: { label: 'Ano', color: 'hsl(var(--chart-2))' },
          mestrado: { label: 'Mestrado', color: '#8884d8' },
          doutorado: { label: 'Doutorado', color: '#82ca9d' },
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
            tickFormatter={(name) => name.length > 15 ? name.slice(0, 15) + '...' : name}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
          {(!filter || filter === 'todas') ? (
            <>
              <Bar dataKey="mestrado" fill="#8884d8" />
              <Bar dataKey="doutorado" fill="#82ca9d" />
            </>
          ) : (
            <Bar dataKey={filter} fill={filter === 'mestrado' ? '#8884d8' : '#82ca9d'} />
          )}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
