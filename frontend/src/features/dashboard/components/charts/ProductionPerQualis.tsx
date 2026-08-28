import { colorFromName } from '@/utils/color.ts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 15;
const QUALIS_ALL = [ 'A1','A2','A3','A4','B1','B2','B3','B4' ];

interface Props {
  publisherType?: 'journal' | 'conference';
  selectedQualis?: string[];
}

export default function ProductionPerQualisChart({ publisherType, selectedQualis }: Props) {
  const auth = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);
  const [ , setChartHeight ] = useState<number>(0);

  useEffect(() => {
    if (chartRef.current) setChartHeight(chartRef.current.clientHeight);
  }, []);

  const qualisFilter = !selectedQualis || selectedQualis.length === QUALIS_ALL.length
    ? undefined
    : selectedQualis;

  const { data: response, isLoading, error } = useQuery({
    queryKey: [ 'productionPerQualis', publisherType, qualisFilter ],
    queryFn: () => dashboardService.productionPerQualis(publisherType, undefined, qualisFilter),
    enabled: !!auth?.isAdmin,
  });

  const years: number[] = Array.isArray(response?.years) ? response.years : [];
  const data: { label: string; data: number[] }[] = Array.isArray(response?.data) ? response.data : [];

  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } = useExpandableChart(years.length, MAX_VISIBLE_BARS);
  const marginBottom = isScrollable ? 'mb-24' : 'mb-16';
  const fontSize = isMobile ? 11 : 18;
  const legendFontSize = isMobile ? 13 : 18;
  const labelFontSize = isMobile ? 10 : 16;

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = years.map((year, index) => {
    const entry: Record<string, unknown> = { year };
    data.forEach(({ label, data: values }) => {
      entry[label] = values[index]; 
    });
    return entry;
  });

  const qualisOrder = [ 'A1','A2','A3','A4','B1','B2','B3','B4','C','NI' ];
  const allQualis = qualisOrder.filter((q) => data.some((d) => d.label === q));
  const qualisForBars = [ ...allQualis ].reverse();

  return (
    <>
      {years.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}
      <ChartScrollWrapper minWidth={chartWidth} isScrollable={isScrollable} className={marginBottom}>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize }} />
              <YAxis tick={{ fontSize }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const sorted = [ ...payload ].reverse();
                    return (
                      <div className="bg-white p-3 border rounded text-sm">
                        <b>{label}</b>
                        {sorted.map((entry, i) => (
                          <div key={i} style={{ color: entry.fill }}>{entry.dataKey} : {entry.value}</div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: legendFontSize }}
                payload={allQualis.map((qualis) => ({
                  value: qualis, type: 'square', color: colorFromName(qualis), id: qualis,
                }))}
              />
              {qualisForBars.map((qualis) => (
                <Bar key={qualis} dataKey={qualis} stackId="a" fill={colorFromName(qualis)} stroke="#ffffff">
                  <LabelList
                    dataKey={qualis}
                    position="center"
                    content={({ x, y, width, height, value }) => {
                      if (!value || Number(value) === 0) return null;
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) + Number(height) / 2}
                          fill="#fff" fontSize={labelFontSize} fontWeight="bold"
                          textAnchor="middle" dominantBaseline="middle"
                        >{value}</text>
                      );
                    }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartScrollWrapper>
    </>
  );
}