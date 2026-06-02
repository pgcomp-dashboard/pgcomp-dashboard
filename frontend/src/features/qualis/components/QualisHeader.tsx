import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QualisHeaderProps {
  onAddClick: () => void;
}

export function QualisHeader({ onAddClick }: QualisHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Qualis</h3>
        <p className="text-muted-foreground">
          Gerencie os qualis cadastrados no sistema.
        </p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar Qualis
      </Button>
    </div>
  );
}
