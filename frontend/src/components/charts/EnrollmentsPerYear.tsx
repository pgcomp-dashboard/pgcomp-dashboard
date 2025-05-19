import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  TooltipProps,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
// import { useQuery } from '@tanstack/react-query';
// import api from '@/services/api';
import { colorFromName } from '@/utils/color';
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
              Matrículas em {label} : {ele.value}
            </text>
            <br />
          </>
        ))}
      </div>
    );
  }
  return null;
};

const chartData = [
  { year: '2014', amount: 45 },
  { year: '2015', amount: 50 },
  { year: '2016', amount: 55 },
  { year: '2017', amount: 60 },
  { year: '2018', amount: 65 },
  { year: '2019', amount: 70 },
  { year: '2020', amount: 75 },
  { year: '2021', amount: 80 },
  { year: '2022', amount: 85 },
  { year: '2023', amount: 90 },
  { year: '2024', amount: 95 },
  { year: '2025', amount: 100 },
];

export default function EnrollmentsPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' }) {
//  const { data, isLoading, error } = useQuery({
//    queryKey: [ 'defenses_per_year', filter ],
//    queryFn: () => api.defensesPerYear(filter),
//  });

  //  if (isLoading) return <>Carregando...</>;
  //  if (error) return <>Erro ao carregar o gráfico</>;

  //  const chartData = Object.entries(data ?? {}).map(([ year, amount ]) => ({
  //    year,
  //    amount,
  //  }));

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
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
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
