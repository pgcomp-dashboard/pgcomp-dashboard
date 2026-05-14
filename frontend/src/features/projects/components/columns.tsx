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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Project } from '@/types/academic';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { SquarePenIcon, Trash } from 'lucide-react';
import { Link } from 'react-router';

const columnHelper = createColumnHelper<Project>();

interface GetProjectColumnsProps {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  confirmDelete: (id: number) => void;
  selectedProject?: Project;
  setProjectToDelete: (project: Project | undefined) => void;
}

export const getProjectColumns = ({
  onEdit,
  onDelete,
  confirmDelete,
  selectedProject,
  setProjectToDelete,
}: GetProjectColumnsProps): ColumnDef<Project, any>[] => [
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: (info) => (
      <div className="text-left align-top">
        <Link
          to={info.row.original.home_page || '#'}
          target={info.row.original.home_page ? '_blank' : ''}
          rel={info.row.original.home_page ? 'noopener noreferrer' : undefined}
        >
          <div className="text-sm leading-snug whitespace-normal wrap-break-word text-justify">
            {info.getValue()}
          </div>
        </Link>
      </div>
    ),
    meta: { className: 'w-[30%]' },
  }),
  columnHelper.accessor('start_year', {
    id: 'start_year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Início" />
    ),
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue()}</div>
    ),
    meta: { className: 'w-[8%]' },
  }),
  columnHelper.accessor('end_year', {
    id: 'end_year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fim" />
    ),
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue() || 'Em andamento'}</div>
    ),
    meta: { className: 'w-[10%]' },
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <div className="text-center text-sm">--</div>;
      const s = val.toUpperCase();
      if (s.includes('ANDAMENTO')) return <div className="text-center"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Em Andamento</span></div>;
      if (s.includes('CONCLU')) return <div className="text-center"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Concluído</span></div>;
      return <div className="text-center text-sm">{val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()}</div>;
    },
    meta: { className: 'w-[10%]' },
  }),
  columnHelper.accessor('nature', {
    id: 'nature',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Natureza" />
    ),
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <div className="text-center text-sm">--</div>;
      return <div className="text-center text-sm">{val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()}</div>;
    },
    meta: { className: 'w-[10%]' },
  }),
  columnHelper.accessor('funding_source', {
    id: 'funding_source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fomento" />
    ),
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue() || '--'}</div>
    ),
    meta: { className: 'w-[10%]' },
  }),
  columnHelper.accessor((row) => row.pivot?.role, {
    id: 'role',
    header: () => 'Função',
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue() || '--'}</div>
    ),
    meta: { className: 'w-[8%]' },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => 'Ações',
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(project)}
            title="Editar"
          >
            <SquarePenIcon className="h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(project)}
                title="Deletar"
              >
                <Trash className="text-red-500 h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogOverlay />
              <AlertDialogContent>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso vai permanentemente
                  deletar o projeto {selectedProject?.name}.
                </AlertDialogDescription>
                <div className="flex justify-end gap-4">
                  <AlertDialogCancel asChild>
                    <Button
                      className="bg-white text-black"
                      onClick={() => setProjectToDelete(undefined)}
                    >
                      Cancelar
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      className="bg-red-400 hover:bg-red-500"
                      onClick={() => selectedProject && confirmDelete(selectedProject.id)}
                    >
                      Sim, deletar projeto
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
        </div>
      );
    },
    meta: { className: 'w-[11%]' },
  }),
];