import { ProjectDashboardSummary } from '@/features/projects/types';

interface ProjectDashboardSummaryCardsProps {
  summary: ProjectDashboardSummary | undefined;
  isLoading: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ProjectDashboardSummaryCards({
  summary,
  isLoading,
}: ProjectDashboardSummaryCardsProps) {
  const cards = [
    { label: 'Total', value: summary?.total ?? '--' },
    { label: 'Nacional', value: summary?.total_nacional ?? '--' },
    { label: 'Internacional', value: summary?.total_internacional ?? '--' },
    { label: 'Em Andamento', value: summary?.total_abertos ?? '--' },
    { label: 'Concluídos', value: summary?.total_concluidos ?? '--' },
    {
      label: 'Total de Valores',
      value: summary ? formatCurrency(summary.total_valor) : '--',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-muted/40 border rounded-lg p-4 flex flex-col gap-1"
        >
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {card.label}
          </span>
          <span
            className={`font-bold text-lg ${
              isLoading ? 'animate-pulse text-muted-foreground' : 'text-foreground'
            }`}
          >
            {isLoading ? '...' : card.value}
          </span>
        </div>
      ))}
    </div>
  );
}