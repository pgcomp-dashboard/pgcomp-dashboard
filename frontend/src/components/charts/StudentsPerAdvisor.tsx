import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CartesianGrid, XAxis, YAxis, BarChart, Tooltip, Bar, Cell, TooltipProps } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import '@/services/api';
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
              Alunos de {label.split(' ')[0]} : {ele.value}
            </text>
            <br />
          </>
        ))}
      </div>
    );
  }
  return null;
};

export default function StudentsPerAdvisorChart({ filter }: { filter?: 'mestrando' | 'doutorando' | 'completed' }) {

  const query = useQuery({
    queryKey: [ 'totalStudentsPerAdvisor', filter ],
    queryFn: async () => {
      return api.totalStudentsPerAdvisor(filter);
    },
  });

  if (query.error) {
    return (<>Falha ao carregar gráfico!</>);
  }

  if (query.isLoading) {
    return <>Carregando...</>; //TODO: spinner...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chartData = Object.entries(query.data ?? {}).map(([ _, advisor_info ]) => ({
    id: advisor_info.id,
    name: advisor_info.name,
    quantity: advisor_info.advisedes_count,
  })).filter((entry) => entry.quantity > 0);

  return (
    <div className="flex items-center justify-center">
      <ChartContainer
        config={{
          journals: {
            label: 'Periódicos',
            color: 'hsl(var(--chart-2))',
          },
          conferences: {
            label: 'Conferências',
            color: 'hsl(var(--chart-3))',
          },
        }}
        className="w-full h-[400px]"
      >
        <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-45}
            textAnchor="end"
            tickFormatter={(name) =>
              name.length > 15 ? name.slice(0, 15) + '...' : name
            }
          />
          <YAxis />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
          <Bar dataKey="quantity" fill="#8884d8" label={{ position: 'top' }}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFromName(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
