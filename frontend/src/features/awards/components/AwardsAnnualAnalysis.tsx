import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAwardsDashboard } from '@/features/awards/hooks/useAwards';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AwardsAnnualAnalysisProps {
  years: number[];
  selectedYears: Set<number> | null;
  onYearChange: (year: number, checked: boolean) => void;
  onSelectAllYears: (checked: boolean) => void;
}

interface RegressionResult {
  intercept: number;
  nationalCoefficient: number;
  internationalCoefficient: number;
  rSquared: number | null;
  observations: number;
}

function calculateRegression(
  rows: {
    national: number;
    international: number;
    student_awards: number;
  }[],
): RegressionResult | null {
  if (rows.length < 4) return null;

  const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const nationalMean = mean(rows.map((row) => row.national));
  const internationalMean = mean(rows.map((row) => row.international));
  const studentMean = mean(rows.map((row) => row.student_awards));
  const nationalVariance = rows.reduce(
    (sum, row) => sum + (row.national - nationalMean) ** 2,
    0,
  );
  const internationalVariance = rows.reduce(
    (sum, row) => sum + (row.international - internationalMean) ** 2,
    0,
  );
  const covariance = rows.reduce(
    (sum, row) =>
      sum +
      (row.national - nationalMean) *
        (row.international - internationalMean),
    0,
  );
  const nationalStudentCovariance = rows.reduce(
    (sum, row) =>
      sum +
      (row.national - nationalMean) * (row.student_awards - studentMean),
    0,
  );
  const internationalStudentCovariance = rows.reduce(
    (sum, row) =>
      sum +
      (row.international - internationalMean) *
        (row.student_awards - studentMean),
    0,
  );
  const determinant =
    nationalVariance * internationalVariance - covariance ** 2;

  if (
    determinant <=
    Number.EPSILON *
      Math.max(1, nationalVariance * internationalVariance) *
      100
  ) {
    return null;
  }

  const nationalCoefficient =
    (nationalStudentCovariance * internationalVariance -
      internationalStudentCovariance * covariance) /
    determinant;
  const internationalCoefficient =
    (internationalStudentCovariance * nationalVariance -
      nationalStudentCovariance * covariance) /
    determinant;
  const intercept =
    studentMean -
    nationalCoefficient * nationalMean -
    internationalCoefficient * internationalMean;
  const residualSumOfSquares = rows.reduce((sum, row) => {
    const prediction =
      intercept +
      nationalCoefficient * row.national +
      internationalCoefficient * row.international;
    return sum + (row.student_awards - prediction) ** 2;
  }, 0);
  const totalSumOfSquares = rows.reduce(
    (sum, row) => sum + (row.student_awards - studentMean) ** 2,
    0,
  );

  return {
    intercept,
    nationalCoefficient,
    internationalCoefficient,
    rSquared:
      totalSumOfSquares > 0
        ? 1 - residualSumOfSquares / totalSumOfSquares
        : null,
    observations: rows.length,
  };
}

const numberFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});
const percentFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function percentage(value: number, total: number): string {
  return `${percentFormat.format(total === 0 ? 0 : (value / total) * 100)}%`;
}

export function AwardsAnnualAnalysis({
  years,
  selectedYears,
  onYearChange,
  onSelectAllYears,
}: AwardsAnnualAnalysisProps) {
  const selectedYearsList =
    selectedYears === null ? undefined : [ ...selectedYears ].sort();
  const { data, isLoading, isError } = useAwardsDashboard(selectedYearsList);

  if (isLoading && !data) {
    return (
      <p className="text-muted-foreground">
        Carregando análise anual de prêmios...
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-destructive">
        Não foi possível carregar a análise anual de prêmios.
      </p>
    );
  }

  const rows = data.analysis_per_year;
  const totals = rows.reduce(
    (sum, row) => ({
      total: sum.total + row.total,
      national: sum.national + row.national,
      international: sum.international + row.international,
      studentAwards: sum.studentAwards + row.student_awards,
    }),
    { total: 0, national: 0, international: 0, studentAwards: 0 },
  );
  const regression = calculateRegression(rows);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Analisar anos
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="award-analysis-year-all"
              checked={selectedYears === null}
              onCheckedChange={(checked) => onSelectAllYears(checked === true)}
            />
            <Label
              htmlFor="award-analysis-year-all"
              className="cursor-pointer"
            >
              Todos
            </Label>
          </div>
          {years.map((year) => (
            <div key={year} className="flex items-center gap-2">
              <Checkbox
                id={`award-analysis-year-${year}`}
                checked={selectedYears === null || selectedYears.has(year)}
                onCheckedChange={(checked) =>
                  onYearChange(year, checked === true)
                }
              />
              <Label
                htmlFor={`award-analysis-year-${year}`}
                className="cursor-pointer"
              >
                {year}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <section className="space-y-2">
        <div>
          <h2 className="text-lg font-semibold">Resumo anual</h2>
          <p className="text-sm text-muted-foreground">
            As porcentagens de abrangência são sobre o total de prêmios do ano.
            A porcentagem discente é a proporção de prêmios com pelo menos um
            discente vencedor.
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Selecione ao menos um ano com prêmios para exibir a análise.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table className="min-w-[1000px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px] text-left">Ano</TableHead>
                  <TableHead className="w-[130px] whitespace-normal text-right leading-tight">
                    Total de prêmios
                  </TableHead>
                  <TableHead className="w-[105px] text-right">
                    Nacionais
                  </TableHead>
                  <TableHead className="w-[120px] text-right">
                    % nacionais
                  </TableHead>
                  <TableHead className="w-[130px] whitespace-normal text-right leading-tight">
                    Internacionais
                  </TableHead>
                  <TableHead className="w-[140px] whitespace-normal text-right leading-tight">
                    % internacionais
                  </TableHead>
                  <TableHead className="w-[165px] whitespace-normal text-right leading-tight">
                    Prêmios com discentes
                  </TableHead>
                  <TableHead className="w-[140px] whitespace-normal text-right leading-tight">
                    % com discentes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="text-left font-medium tabular-nums">
                      {row.year}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.total}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.national}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {percentage(row.national, row.total)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.international}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {percentage(row.international, row.total)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.student_awards}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {percentage(row.student_awards, row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="whitespace-normal text-left">
                    Total selecionado
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.total}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.national}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {percentage(totals.national, totals.total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.international}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {percentage(totals.international, totals.total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.studentAwards}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {percentage(totals.studentAwards, totals.total)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <h2 className="text-lg font-semibold">Regressão linear múltipla</h2>
          <p className="text-sm text-muted-foreground">
            Estima a quantidade anual de prêmios com discentes a partir das
            quantidades de prêmios nacionais e internacionais. O modelo usa
            somente os anos selecionados e descreve associação, não causalidade.
          </p>
        </div>
        {rows.length < 4 ? (
          <p className="text-sm text-muted-foreground">
            São necessários pelo menos quatro anos selecionados para estimar o
            modelo com dois preditores e manter graus de liberdade residuais.
          </p>
        ) : !regression ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível estimar o modelo: as quantidades nacionais e
            internacionais não variam de forma independente nos anos
            selecionados.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Anos analisados',
                  value: regression.observations,
                },
                {
                  label: 'R²',
                  value:
                    regression.rSquared === null
                      ? 'Indefinido'
                      : numberFormat.format(regression.rSquared),
                },
                {
                  label: 'Coeficiente nacional',
                  value: numberFormat.format(regression.nationalCoefficient),
                },
                {
                  label: 'Coeficiente internacional',
                  value: numberFormat.format(
                    regression.internationalCoefficient,
                  ),
                },
              ].map((item) => (
                <div key={item.label} className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="break-words rounded-md bg-muted/40 p-3 text-sm">
              Modelo: prêmios com discentes ={' '}
              {numberFormat.format(regression.intercept)} + (
              {numberFormat.format(regression.nationalCoefficient)} × prêmios
              nacionais) + (
              {numberFormat.format(regression.internationalCoefficient)} ×
              prêmios internacionais).
            </p>
            {regression.rSquared !== null && (
              <p className="text-sm text-muted-foreground">
                O modelo explica {percentFormat.format(regression.rSquared * 100)}%
                da variação observada na quantidade de prêmios com discentes nos
                anos selecionados. Os coeficientes representam a variação
                estimada mantendo o outro preditor constante.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
