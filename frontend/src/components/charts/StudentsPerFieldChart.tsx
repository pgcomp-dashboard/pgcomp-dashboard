import { Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ChartContainer } from '@/components/ui/chart.tsx';
import { colorFromName } from '@/utils/color.ts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import './chart.css';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>)  => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <>
            <text className="tooltip-text" key={index}>
              Quantidade de Alunos : {ele.value}
            </text>
            <br />
          </>
        ))}
      </div>
    );
  }
  return null;
};

export default function StudentsPerFieldChart({ filter }: { filter?: 'mestrando' | 'doutorando' | 'completed' }) {

  const query = useQuery({
    queryKey: [ 'studentsPerField', filter ],
    queryFn: async () => {
      return api.studentsPerField(filter);
    },
  });

  if (query.error) {
    return (<>Falha ao carregar gráfico!</>);
  }

  if (query.isLoading) {
    return <>Carregando...</>; //TODO: spinner...
  }

  const chartData = Object.entries(query.data ?? {}).map(([ name, value ]) => ({
    name,
    value,
  }));

  return (
    <div className="flex items-center justify-center">
      <ChartContainer
        config={{
          students: {
            label: 'Students',
            color: 'hsl(var(--chart-1))',
          },
        }}
        className="w-full h-[400px]"
      >
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <YAxis type="number" />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
          <Bar dataKey="value" fill="#8884d8" label={{ position: 'top' }}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFromName(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
