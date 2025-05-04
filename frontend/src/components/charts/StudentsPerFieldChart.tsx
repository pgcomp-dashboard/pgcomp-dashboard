import { Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx';
import { colorFromName } from '@/utils/color.ts';

export default function StudentsPerFieldChart({ filter }: { filter?: 'mestrando' | 'doutorando' | 'completed' }) {

  const query = useQuery({
    queryKey: ['studentsPerField', filter],
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

  const chartData = Object.entries(query.data ?? {}).map(([name, value]) => ({
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="value" name="Quantidade de alunos">
            {
              chartData.map(e => (
                <Cell key={`cell-${e.name}`} fill={colorFromName(e.name)} />
              ))
            }
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}