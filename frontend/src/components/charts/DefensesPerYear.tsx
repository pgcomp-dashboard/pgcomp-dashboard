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
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>)  => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <>
            <text className="tooltip-text" key={index}>
              Defesas em {label} : {ele.value}
            </text>
            <br />
          </>
        ))}
      </div>
    );
  }
  return null;
};

export default function DefensesPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' | 'todas' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'defenses_per_year', filter ],
    queryFn: () => api.defensesPerYear(filter === 'todas' ? undefined : filter),
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
  console.log(chartData);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="mestrado" fill="#8884d8" />
          <Bar dataKey="doutorado" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  
}
