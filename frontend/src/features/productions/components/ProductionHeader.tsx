import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Professor } from "@/types/user";

interface ProductionHeaderProps {
  isAdmin?: boolean;
  score: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isPending: boolean;
  selectedProfessorId: string;
  onProfessorChange: (value: string) => void;
  professorsList: Professor[];
}

export function ProductionHeader({
  isAdmin,
  score,
  hasActiveFilters,
  isLoading,
  isPending,
  selectedProfessorId,
  onProfessorChange,
  professorsList,
}: ProductionHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Produções
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualize, crie e edite produções.
        </p>
      </div>
      <div className='w-full flex flex-row items-center'>
      {isAdmin && (
        <div className="w-full max-w-md mx-auto mb-4">
          <Label className="text-sm font-medium mb-1.5 block">
            Visualizar produções de:
          </Label>
          <Select
            value={selectedProfessorId}
            onValueChange={onProfessorChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um docente" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="own">Minhas produções</SelectItem>
              {professorsList.map((prof) => (
                <SelectItem key={prof.id} value={prof.id.toString()}>
                  {prof.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-full space-y-3">
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">
                {hasActiveFilters ? 'Pontuação filtrada:' : 'Pontuação total:'}
              </span>
            {(isLoading || isPending) ? (
              <Skeleton className="h-6 w-12 bg-primary/20" />
            ) : (
              <span className="text-lg font-bold text-primary">
                    {score}
              </span>
            )}
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}
