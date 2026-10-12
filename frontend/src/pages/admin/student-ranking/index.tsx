import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StudentRankingTable } from "@/features/student-ranking/components/StudentRankingTable";
import { useStudentRanking } from "@/features/student-ranking/hooks/useStudentRanking";
import { cn } from "@/lib/utils";
import { EyeOff, Loader2, RotateCw } from "lucide-react";
import { useState } from "react";
import { StudentRanking } from "@/types/academic";

export default function StudentRankingPage() {
  const [blurNames, setBlurNames] = useState(false);
  const [studentToDelete, setStudentToDelete] =
    useState<StudentRanking | null>(null);
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
    isEligible,
    setIsEligible,
    courses,
    sorting,
    setSorting,
    deleteMutation,
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

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="student-ranking-eligibility"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Situação
          </Label>
          <Select
            value={
              isEligible === null ? "all" : isEligible ? "eligible" : "ineligible"
            }
            onValueChange={(value) => {
              setIsEligible(
                value === "all" ? null : value === "eligible",
              );
              setPage(1);
            }}
          >
            <SelectTrigger
              id="student-ranking-eligibility"
              className="w-56 bg-background"
            >
              <SelectValue placeholder="Todas as situações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="eligible">Aptos</SelectItem>
              <SelectItem value="ineligible">Fora dos critérios</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
          <EyeOff className="h-4 w-4 text-muted-foreground" />
          <Label
            htmlFor="student-ranking-blur-names"
            className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Ocultar nomes
          </Label>
          <Switch
            id="student-ranking-blur-names"
            checked={blurNames}
            onCheckedChange={setBlurNames}
          />
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
        blurNames={blurNames}
        onDelete={setStudentToDelete}
      />

      <DeleteConfirmDialog
        open={studentToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setStudentToDelete(null);
        }}
        title="Excluir discente"
        itemLabel={studentToDelete?.name}
        isDeleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (!studentToDelete) return;
          deleteMutation.mutate(studentToDelete.user_id, {
            onSuccess: () => setStudentToDelete(null),
          });
        }}
      />
    </div>
  );
}
