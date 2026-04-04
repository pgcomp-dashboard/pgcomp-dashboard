import { Professor } from '@/types/user';

interface ProjectHeaderProps {
  isAdmin?: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  selectedProfessorId: string;
  onProfessorChange: (value: string) => void;
  professorsList: Professor[];
}

export function ProjectHeader({
  isAdmin,
  isLoading,
  isPending,
  selectedProfessorId,
  onProfessorChange,
  professorsList,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">Projetos</h1>
      <p className="text-muted-foreground">Visualize, crie e edite projetos.</p>

      {isAdmin && (
        <div className="flex items-center gap-2 mt-2">
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
    </div>
  );
}