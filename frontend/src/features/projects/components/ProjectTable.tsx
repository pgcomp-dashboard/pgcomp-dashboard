import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Project } from "@/types/academic";
import { OnChangeFn, Row, SortingState } from "@tanstack/react-table";
import { SquarePenIcon, Trash } from "lucide-react";
import { useMemo } from "react";
import { getProjectColumns } from "./columns";

interface ProjectTableProps {
  isLoading: boolean;
  projects: Project[];
  sortConfig: { key: string; direction: "asc" | "desc" };
  onSort: (key: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  confirmDelete: (id: number) => void;
  selectedProject?: Project;
  setProjectToDelete: (project: Project | undefined) => void;
}

export function ProjectTable({
  isLoading,
  projects,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  confirmDelete,
  selectedProject,
  setProjectToDelete,
}: ProjectTableProps) {
  const columns = useMemo(
    () => getProjectColumns({ onEdit, onDelete, confirmDelete, selectedProject, setProjectToDelete }),
    [onEdit, onDelete, confirmDelete, selectedProject, setProjectToDelete],
  );

  const sorting = useMemo<SortingState>(
    () => [{ id: sortConfig.key, desc: sortConfig.direction === "desc" }],
    [sortConfig],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === "function"
      ? updaterOrValue(sorting)
      : updaterOrValue;
    const firstSort = newSorting[0];
    if (firstSort) onSort(firstSort.id);
  };

  const renderMobileCard = (row: Row<Project>) => {
    const project = row.original;
    return (
      <div className="flex flex-col">
        <div className="p-3 bg-muted/30 border-b">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{project.name}</h3>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Início</span>
              <span className="font-medium">{project.start_year}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Fim</span>
              <span className="font-medium">{project.end_year || "Em andamento"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Status</span>
              <span className="font-medium">{project.status || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Natureza</span>
              <span className="font-medium">{project.nature || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Fomento</span>
              <span className="font-medium">{project.funding_source || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Função</span>
              <span className="font-medium">{project.pivot?.role || "--"}</span>
            </div>
          </div>
        </div>
        <CardFooter className="flex border-t mt-auto items-stretch p-0">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm bg-transparent hover:bg-accent"
            onClick={() => onEdit(project)}
          >
            <SquarePenIcon className="h-4 w-4 mr-2" /> Editar
          </Button>
          <div className="w-px bg-border" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-11 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(project)}
              >
                <Trash className="h-4 w-4 mr-2" /> Deletar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogOverlay />
              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-auto">
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Essa ação não pode ser desfeita. Isso vai permanentemente deletar o projeto.
                </AlertDialogDescription>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                  <AlertDialogCancel asChild>
                    <Button variant="outline" onClick={() => setProjectToDelete(undefined)}>
                      Cancelar
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => selectedProject && confirmDelete(selectedProject.id)}
                    >
                      Deletar
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
        </CardFooter>
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      emptyMessage="Não foram encontrados projetos cadastrados para o usuário"
      sorting={sorting}
      onSortingChange={handleSortingChange}
      renderMobileCard={renderMobileCard}
      getRowClassName={() => "align-top"}
      pagination={{ pageIndex: 0, pageSize: projects.length || 9999 }}
    />
  );
}