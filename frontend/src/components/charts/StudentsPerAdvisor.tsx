import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CartesianGrid, XAxis, YAxis, BarChart, Tooltip, Bar, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import '@/services/api';

export default function StudentsPerAdvisorChart({ filter }: { filter?: 'journal' | 'conference' }) {

  const colors = ['blue', 'red', 'green', 'gray', 'purple'];

  const query = useQuery({
    queryKey: ['totalStudentsPerAdvisor', filter],
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

  console.log(query);

  const chartData = Object.entries(query.data ?? {}).map(([_, advisor]) => ({
    id: advisor.id,
    name: advisor.name,
    quantity: advisor.advisedes_count,
  })).filter((entry) => entry.quantity > 0);

  console.log(chartData);

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
              name.length > 15 ? name.slice(0, 15) + "..." : name
            }
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" label={{ position: 'top' }}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 5]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
