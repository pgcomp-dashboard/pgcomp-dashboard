import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ProjectDashboardRow } from '@/features/projects/types';
import { ColumnDef, createColumnHelper, SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface ProjectDashboardTableProps {
  data: ProjectDashboardRow[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<ProjectDashboardRow>();

const formatCurrency = (value: number | null) =>
  value != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    : '--';

const statusLabel = (status: string | null) => {
  if (!status) return '--';
  const s = status.toUpperCase();
  if (s.includes('ANDAMENTO')) return 'Em Andamento';
  if (s.includes('CONCLU')) return 'Concluído';
  return status;
};

export function ProjectDashboardTable({ data, isLoading }: ProjectDashboardTableProps) {
  const [ sorting, setSorting ] = useState<SortingState>([
    { id: 'start_year', desc: true },
  ]);

  const columns = useMemo<ColumnDef<ProjectDashboardRow, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Projeto" />
        ),
        cell: (info) => (
          <div className="font-medium text-left max-w-xs truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('nature', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Natureza" />
        ),
        cell: (info) => (
          <div className="text-center capitalize">{info.getValue() ?? '--'}</div>
        ),
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const s = row.original.status?.toUpperCase() ?? '';
          const label = statusLabel(row.original.status);
          const isOpen = s.includes('ANDAMENTO');
          const isDone = s.includes('CONCLU');
          return (
            <div className="flex justify-center">
              {isOpen ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {label}
                </span>
              ) : isDone ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {label}
                </span>
              ) : (
                <span className="text-center text-muted-foreground text-xs">{label}</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('start_year', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Início" />
        ),
        cell: (info) => (
          <div className="text-center">{info.getValue() ?? '--'}</div>
        ),
      }),
      columnHelper.accessor('end_year', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fim" />
        ),
        cell: (info) => (
          <div className="text-center">{info.getValue() ?? '--'}</div>
        ),
      }),
      columnHelper.accessor('value', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Valor" />
        ),
        cell: (info) => (
          <div className="text-center font-medium">{formatCurrency(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor('funding_source', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Financiador" />
        ),
        cell: (info) => (
          <div className="text-center">{info.getValue() ?? '--'}</div>
        ),
      }),
      columnHelper.accessor('participants', {
        header: 'Docentes',
        enableSorting: false,
        cell: (info) => {
          const names = info.getValue().map((p: { name: string }) => p.name).join(', ');
          return (
            <div
              className="text-center text-xs text-muted-foreground max-w-xs truncate"
              title={names}
            >
              {names || '--'}
            </div>
          );
        },
      }),
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      sorting={sorting}
      onSortingChange={setSorting}
      emptyMessage="Nenhum projeto encontrado"
      pagination={{
        pageIndex: 0,
        pageSize: 1000,
      }}
    />
  );
}