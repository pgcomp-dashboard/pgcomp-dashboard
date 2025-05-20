type ExpandChartButtonProps = {
  expanded: boolean;
  toggleExpand: () => void;
};

export default function ExpandChartButton({ expanded, toggleExpand }: ExpandChartButtonProps) {
  return (
    <div className="flex justify-end mb-2">
      <button
        className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        onClick={toggleExpand}
      >
        {expanded ? 'Ativar Scroll' : 'Gráfico Completo'}
      </button>
    </div>
  );
}
