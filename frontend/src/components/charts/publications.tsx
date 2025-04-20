import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Sample data for publications over years
const data = [
  { year: '2014', journals: 45, conferences: 30 },
  { year: '2015', journals: 50, conferences: 35 },
  { year: '2016', journals: 55, conferences: 40 },
  { year: '2017', journals: 60, conferences: 45 },
  { year: '2018', journals: 65, conferences: 50 },
  { year: '2019', journals: 70, conferences: 55 },
  { year: '2020', journals: 75, conferences: 60 },
  { year: '2021', journals: 80, conferences: 65 },
  { year: '2022', journals: 85, conferences: 70 },
  { year: '2023', journals: 90, conferences: 75 },
  { year: '2024', journals: 95, conferences: 80 },
  { year: '2025', journals: 100, conferences: 85 },
];

export default function PublicationsChart({ filter }: {
  filter?: 'conferences' | 'journals'
}) {
  console.log(filter);
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
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="journals"
              stroke="#5B9279"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="conferences"
              stroke="#8FCB9B"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
