import { Button } from './button';

type ExpandChartButtonProps = {
  expanded: boolean;
  toggleExpand: () => void;
};

export default function ExpandChartButton({ expanded, toggleExpand }: ExpandChartButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={toggleExpand}
    >
      {expanded ? 'Ativar Scroll' : 'Gráfico Completo'}
    </Button>
  );
}
