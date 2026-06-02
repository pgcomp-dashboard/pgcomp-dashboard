interface ProfessorHeaderProps {
  counts: {
    permanente: number;
    colaborador: number;
    visitante: number;
  };
}

export function ProfessorHeader({ counts }: ProfessorHeaderProps) {
  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Docentes
        </h1>
        <p className="ml-4 text-muted-foreground text-sm">
          ({counts.permanente} Permanentes, {counts.colaborador} Colaboradores,{" "}
          {counts.visitante} Visitantes)
        </p>
      </div>
      <p className="text-muted-foreground">
        Visualize e gerencie os docentes cadastrados no sistema.
      </p>
    </div>
  );
}
