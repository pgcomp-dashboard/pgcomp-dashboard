import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StudentHeaderProps {
  onAddClick: () => void;
}

export function StudentHeader({ onAddClick }: StudentHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Discentes</h1>
        <p className="text-muted-foreground">Gerencie os estudantes cadastrados no sistema.</p>
      </div>
      <Button data-cy="add-student-button" onClick={onAddClick} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Adicionar estudante
      </Button>
    </header>
  );
}
