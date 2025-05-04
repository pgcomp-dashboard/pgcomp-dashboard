import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx';
import { colorFromName } from '@/utils/color.ts';
import { useRef, useState, useEffect } from 'react';

export default function ProductionPerQualisChart() {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chartHeight, setChartHeight] = useState<number>(0);

    useEffect(() => {
        if (chartRef.current) {
            setChartHeight(chartRef.current.clientHeight);
        }
    }, []);

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

    const CustomBarLabel = ({ index, value, dataKey, data, x, width, yAxisDomain }: any) => {
        if (!value || !chartHeight || !yAxisDomain) return null;

        const yearData = data[index];
        const keys = Object.keys(yearData).filter(k => k !== 'year');
        const currentIndex = keys.indexOf(dataKey);
        const previousKeys = keys.slice(0, currentIndex);
        const previousTotal = previousKeys.reduce((sum, key) => sum + (yearData[key] || 0), 0);

        const maxYValue = yAxisDomain[1] ?? 100;

        // Altura da barra atual e posição
        const barHeight = (value / maxYValue) * chartHeight;
        const baseHeight = (previousTotal / maxYValue) * chartHeight;

        const centerY = chartHeight - baseHeight - barHeight / 2;

        return (
            <text
                x={x + width / 2}
                y={centerY}
                fill="#fff"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {value}
            </text>
        );
    };

    return (
        <div className="flex items-center justify-center w-full" ref={chartRef}>
            <ChartContainer
                config={{
                    productions: {
                        label: 'Produções por qualis',
                        color: 'hsl(var(--chart-4))',
                    },
                }}
                className="w-full h-[400px]"
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
                            label={<CustomBarLabel />}
                            fill={colorFromName(qualis + 55)}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </div>
    );
}
