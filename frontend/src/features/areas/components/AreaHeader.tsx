import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AreaHeaderProps {
  onAddClick: () => void;
}

export function AreaHeader({ onAddClick }: AreaHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Áreas de Pesquisa</h1>
        <p className="text-muted-foreground">Gerencie as áreas acadêmicas do programa.</p>
      </div>

      <Button className="flex gap-2" onClick={onAddClick}>
        <Plus className="h-4 w-4" />
        Adicionar Área
      </Button>
    </header>
  );
}
