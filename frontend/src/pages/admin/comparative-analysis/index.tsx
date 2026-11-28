import ComparativeConferenceAnalysis from "@/features/dashboard/components/ComparativeConferenceAnalysis";

export default function ComparativeAnalysisPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Análise comparativa com universidades conceito 7
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparação institucional de produções em conferências, periódicos e doutorados.
        </p>
      </div>
      <ComparativeConferenceAnalysis />
    </div>
  );
}
