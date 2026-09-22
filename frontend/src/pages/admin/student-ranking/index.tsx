import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentRankingTable } from "@/features/student-ranking/components/StudentRankingTable";
import { useStudentRanking } from "@/features/student-ranking/hooks/useStudentRanking";
import { cn } from "@/lib/utils";
import { Loader2, RotateCw } from "lucide-react";

export default function StudentRankingPage() {
  const {
    ranking,
    pagination,
    isLoading,
    isFetching,
    error,
    refetch,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    years,
    page,
    setPage,
    perPage,
    setPerPage,
    courseId,
    setCourseId,
    courses,
    sorting,
    setSorting,
  } = useStudentRanking();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="mr-2 animate-spin" />
        Carregando ranking de discentes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center justify-center p-10">
        Erro ao carregar ranking de discentes.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ranking de discentes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Produções acadêmicas pontuadas pelo Qualis no período selecionado.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="student-ranking-start"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Ano início
          </Label>
          <Select
            value={startYear.toString()}
            onValueChange={(value) => {
              const year = Number(value);
              setStartYear(year);
              setPage(1);
              if (year > endYear) setEndYear(year);
            }}
          >
            <SelectTrigger
              id="student-ranking-start"
              className="w-32 bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="student-ranking-end"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Ano fim
          </Label>
          <Select
            value={endYear.toString()}
            onValueChange={(value) => {
              const year = Number(value);
              setEndYear(year);
              setPage(1);
              if (year < startYear) setStartYear(year);
            }}
          >
            <SelectTrigger
              id="student-ranking-end"
              className="w-32 bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="student-ranking-course"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Curso
          </Label>
          <Select
            value={courseId?.toString() ?? "all"}
            onValueChange={(value) => {
              setCourseId(value === "all" ? null : Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger
              id="student-ranking-course"
              className="w-56 bg-background"
            >
              <SelectValue placeholder="Todos os cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Atualizar ranking"
        >
          <RotateCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>

      <StudentRankingTable
        ranking={ranking}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
        page={page}
        perPage={perPage}
        setPage={setPage}
        setPerPage={setPerPage}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
}
