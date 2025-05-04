import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import api from '@/services/api';
import { colorFromName } from '@/utils/color.ts';

export default function ProductionPerQualisChart() {
    const chartRef = useRef<HTMLDivElement>(null);
    const [, setChartHeight] = useState<number>(0);

    useEffect(() => {
        if (chartRef.current) {
            setChartHeight(chartRef.current.clientHeight);
        }
    }, []);

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['productionPerQualis'],
        queryFn: () => api.productionPerQualis(),
    });

    if (isLoading) return <>Carregando...</>;
    if (error) return <>Erro ao carregar o gráfico</>;

    const years: number[] = Array.isArray(response?.years) ? response.years : [];
    const data: { label: string; data: number[] }[] = Array.isArray(response?.data)
        ? response.data
        : [];

    // Organize data for each year
    const chartData = years.map((year, index) => {
        const entry: Record<string, any> = { year };
        data.forEach(({ label, data }) => {
            entry[label] = data[index];
        });
        return entry;
    });

    const allQualis = data.map((d) => d.label);

    {/*}    // Custom label for bar values
    const CustomBarLabel = (props: any) => {
        const { x, y, width, height, value } = props;

        if (value === 0 || height < 10) return null; // Avoid showing labels for zero or very small segments

        // Position the label in the center of the bar segment
        const labelY = y + height / 2;

        return (
            <text
                x={x + width / 2}
                y={labelY}
                fill="#fff"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {value}
            </text>
        );
    };
*/}
    return (
        <div className="w-full h-[400px]" ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                    {allQualis.map((qualis) => (
                        <Bar
                            key={qualis}
                            dataKey={qualis}
                            stackId="a"
                            fill={colorFromName(qualis)}
                            stroke="#ffffff"
                        //label={<CustomBarLabel />}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
