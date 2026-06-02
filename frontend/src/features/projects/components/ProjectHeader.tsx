import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Professor } from '@/types/user';

const YEARS = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => 2000 + i,
).reverse();

interface ProjectHeaderProps {
  isAdmin?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  selectedProfessorId: string;
  onProfessorChange: (value: string) => void;
  professorsList: Professor[];
  startYear: number | null;
  endYear: number | null;
  onStartYearChange: (value: number | null) => void;
  onEndYearChange: (value: number | null) => void;
}

export function ProjectHeader({
  isAdmin,
  isLoading,
  isPending,
  selectedProfessorId,
  onProfessorChange,
  professorsList,
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">Projetos</h1>
      <p className="text-muted-foreground">Visualize, crie e edite projetos.</p>

      <div className="flex flex-wrap items-end gap-4 mt-2 bg-muted/40 p-4 rounded-lg border">
        {isAdmin && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Docente
            </Label>
            <select
              aria-label="Selecionar professor"
              className="border rounded-md px-3 py-2 text-sm"
              value={selectedProfessorId}
              onChange={(e) => onProfessorChange(e.target.value)}
              disabled={isLoading || isPending}
            >
              <option value="own">Meus projetos</option>
              {professorsList.map((professor) => (
                <option key={professor.id} value={String(professor.id)}>
                  {professor.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Início
          </Label>
          <Select
            value={startYear?.toString() ?? 'all'}
            onValueChange={(v) => onStartYearChange(v === 'all' ? null : parseInt(v))}
          >
            <SelectTrigger className="w-32 bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Fim
          </Label>
          <Select
            value={endYear?.toString() ?? 'all'}
            onValueChange={(v) => onEndYearChange(v === 'all' ? null : parseInt(v))}
          >
            <SelectTrigger className="w-32 bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}