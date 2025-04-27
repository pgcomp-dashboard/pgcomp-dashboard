import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx';
import { colorFromName } from '@/utils/color.ts';

export default function ProductionPerQualisChart() {
    const query = useQuery({
        queryKey: ['productionPerQualis'],
        queryFn: async () => {
            return api.productionPerQualis(); // Estrutura com `years` e `data`
        },
    });

    if (query.error) return <>Falha ao carregar gráfico!</>;
    if (query.isLoading) return <>Carregando...</>;

    const response = query.data ?? { years: [], data: [] };
    const years: number[] = Array.isArray(response.years) ? response.years : [];
    const data: { label: string; data: number[] }[] = Array.isArray(response.data)
        ? response.data
        : [];

    // Reorganiza os dados no formato { year: 2014, A1: 3, A2: 0, ... }
    const chartData = years.map((year: number, index: number) => {
        const entry: Record<string, any> = { year };
        data.forEach((qualisEntry: any) => {
            entry[qualisEntry.label] = qualisEntry.data[index];
        });
        return entry;
    });

    const allQualis = data.map((d: any) => d.label);

    return (
        <div className="flex items-center justify-center w-full">
            <ChartContainer
                config={{
                    productions: {
                        label: 'Produções por qualis',
                        color: 'hsl(var(--chart-4))',
                    },
                }}
                className="h-[400px]"
            >
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {allQualis.map((qualis) => (
                        <Bar
                            key={qualis}
                            dataKey={qualis}
                            name={qualis}
                            stackId="a" // Remova se quiser colunas agrupadas
                            fill={colorFromName(qualis + 55)}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </div>
    );
}
