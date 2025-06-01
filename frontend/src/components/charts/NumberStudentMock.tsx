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
import api from '@/services/api';
import { useQuery } from '@tanstack/react-query';
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

// const mockStudentData = [
//   { category: 'Alunos Atuais - Mestrado', amount: 35 },
//   { category: 'Alunos Atuais - Doutorado', amount: 80 },
//   { category: 'Alunos Concluídos - Mestrado', amount: 200 },
//   { category: 'Alunos Concluídos - Doutorado', amount: 250 },
// ];

export default function NumberStudentsChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'number_of_students' ],
    queryFn: () => api.numberOfStudents(),
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          category: {
            label: 'Categoria',
            color: 'hsl(var(--chart-2))',
          },
          amount: {
            label: 'Número',
            color: 'hsl(var(--chart-3))',
          },
        }}
        className="w-full h-[400px]"
      >
        <BarChart
          margin={{ top: 20, right: 5, left: 5, bottom: 80 }}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            interval={0}
            tickFormatter={(name) =>
              name.length > 25 ? name.slice(0, 25) + '...' : name
            }
            tick={{ fontSize: 18 }}
          />
          <YAxis tick={{ fontSize: 18 }}/>
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
          <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top', style: { fontSize: 18 } }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFromName(entry.category)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}