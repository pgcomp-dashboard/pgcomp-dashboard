
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
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Production } from "@/types/academic";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { SquarePenIcon, Trash } from "lucide-react";
import { Link } from "react-router";

const columnHelper = createColumnHelper<Production>();

interface GetProductionColumnsProps {
  onEdit: (production: Production) => void;
  onDelete: (production: Production) => void;
  confirmDelete: (id: number) => void;
  selectedProduction?: Production;
  setProductionToDelete: (production: Production | undefined) => void;
}

export const getProductionColumns = ({
  onEdit,
  onDelete,
  confirmDelete,
  selectedProduction,
  setProductionToDelete,
}: GetProductionColumnsProps): ColumnDef<Production, any>[] => [
  columnHelper.accessor("title", {
    id: "titulo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Título" />
    ),
    cell: (info) => (
      <div className="text-left align-top">
        <Link
          to={info.row.original.doi || info.row.original.home_page || "#"}
          target={
            info.row.original.doi || info.row.original.home_page
              ? "_blank"
              : ""
          }
          rel={
            info.row.original.doi || info.row.original.home_page
              ? "noopener noreferrer"
              : undefined
          }
        >
          <div
            className="text-sm leading-snug whitespace-normal wrap-break-word text-justify"
            title={info.getValue()}
          >
            {info.getValue()}
          </div>
        </Link>
      </div>
    ),
    meta: {
      className: "w-[25%]",
    }
  }),
  columnHelper.accessor((row) => row.publisher?.name, {
    id: "local",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Local" />
      </div>
    ),
    cell: (info) => (
      <div
        className="text-sm leading-snug whitespace-normal wrap-break-word capitalize text-center"
        title={info.getValue() || "--"}
      >
        {info.getValue()?.toLowerCase() || "N/A"}
      </div>
    ),
    meta: {
      className: "w-[20%]",
    }
  }),
  columnHelper.accessor("year", {
    id: "year",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Ano" />
      </div>
    ),
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue()}</div>
    ),
    meta: {
      className: "w-[8%]",
    }
  }),
  columnHelper.accessor("publisher_type", {
    id: "tipo",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    cell: (info) => (
      <div className="text-center text-sm">
        {info.getValue() === "journal" ? "Revista" : "Conferência"}
      </div>
    ),
    meta: {
      className: "w-[10%]",
    }
  }),
  columnHelper.accessor("source", {
    id: "origem",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Origem" />
      </div>
    ),
    cell: (info) => (
      <div className="text-center text-sm capitalize">
        {info.getValue() === "xml" || info.getValue() === "lattes"
          ? "Lattes"
          : info.getValue()}
      </div>
    ),
    meta: {
      className: "w-[10%]",
    }
  }),
  columnHelper.accessor((row) => row.publisher?.stratum_qualis?.code, {
    id: "qualis",
    header: () => <div className="text-center text-xs font-semibold">Qualis</div>,
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue() || "--"}</div>
    ),
    meta: {
      className: "w-[8%]",
    }
  }),
  columnHelper.accessor((row) => row.publisher?.stratum_qualis?.score, {
    id: "pontuacao",
    header: ({ column }) => (
      <div className="text-center">
         <DataTableColumnHeader column={column} title="Pts" />
      </div>
    ),
    cell: (info) => (
      <div className="text-center text-sm">{info.getValue() || "--"}</div>
    ),
    meta: {
      className: "w-[8%]",
    }
  }),
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-center text-xs font-semibold">Ações</div>,
    cell: ({ row }) => {
      const production = row.original;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(production)}
            title="Editar"
          >
            <SquarePenIcon className="h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(production)}
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
                  deletar a produção {selectedProduction?.title}.
                </AlertDialogDescription>
                <div className="flex justify-end gap-4">
                  <AlertDialogCancel asChild>
                    <Button
                      className="bg-white text-black"
                      onClick={() => setProductionToDelete(undefined)}
                    >
                      Cancelar
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      className="bg-red-400 hover:bg-red-500"
                      onClick={() =>
                        selectedProduction &&
                        confirmDelete(selectedProduction.id)
                      }
                    >
                      Sim, deletar produção
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
        </div>
      );
    },
    meta: {
      className: "w-[11%]",
    }
  }),
];
