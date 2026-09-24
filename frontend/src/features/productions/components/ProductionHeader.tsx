import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Professor, Student } from "@/types/user";
import { Clock } from "lucide-react";

interface ProductionHeaderProps {
  mode?: "professor" | "student";
  isAdmin?: boolean;
  score: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isPending: boolean;
  selectedProfessorId: string;
  onProfessorChange: (value: string) => void;
  professorsList: Professor[];
  studentsList: Student[];
  lastXmlUpdate?: string;
}

export function ProductionHeader({
  mode = "professor",
  isAdmin,
  score,
  hasActiveFilters,
  isLoading,
  isPending,
  selectedProfessorId,
  onProfessorChange,
  professorsList,
  studentsList,
  lastXmlUpdate,
}: ProductionHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formattedDate = formatDate(lastXmlUpdate);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Produções
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualize, crie e edite produções.
        </p>
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 px-3 py-1 rounded-full mt-1">
            <Clock className="w-3.5 h-3.5" />
            Última atualização: {formattedDate}
          </div>
        )}
      </div>
      <div className="w-full flex flex-row items-center">
        {isAdmin && mode === "professor" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Produções de docente
              </Label>
              <Select
                value={
                  selectedProfessorId.startsWith("professor:") ||
                  selectedProfessorId === "own"
                    ? selectedProfessorId
                    : "none"
                }
                onValueChange={(value) =>
                  value !== "none" && onProfessorChange(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um docente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Nenhum docente selecionado
                  </SelectItem>
                  <SelectItem value="own">Minhas produções</SelectItem>
                  {professorsList.map((prof) => (
                    <SelectItem
                      key={`professor-${prof.id}`}
                      value={`professor:${prof.id}`}
                    >
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {isAdmin && mode === "student" && (
          <div className="w-full mb-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Produções de discente
              </Label>
              <Select
                value={
                  selectedProfessorId.startsWith("student:")
                    ? selectedProfessorId
                    : "none"
                }
                onValueChange={(value) =>
                  value !== "none" && onProfessorChange(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um discente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Nenhum discente selecionado
                  </SelectItem>
                  {studentsList.map((student) => (
                    <SelectItem
                      key={`student-${student.id}`}
                      value={`student:${student.id}`}
                    >
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="w-full space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">
                {hasActiveFilters ? "Pontuação filtrada:" : "Pontuação total:"}
              </span>
              {isLoading || isPending ? (
                <Skeleton className="h-6 w-12 bg-primary/20" />
              ) : (
                <span className="text-lg font-bold text-primary">{score}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
