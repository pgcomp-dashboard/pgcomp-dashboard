import LattesIcon from "@/components/LattesIcon";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Ranking } from "@/types/academic";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { BookOpenTextIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

interface AccreditationTableProps {
  ranking: Ranking[];
  isLoading: boolean;
  onShowDetails: (userId: number) => void;
}

const columnHelper = createColumnHelper<Ranking>();

export function AccreditationTable({
  ranking,
  isLoading,
  onShowDetails,
}: AccreditationTableProps) {
  const columns = useMemo<ColumnDef<Ranking, any>[]>(
    () => [
      columnHelper.display({
        id: "colocacao",
        header: () => <div className="text-center">Colocação</div>,
        cell: ({ row }) => {
          const score = row.original.total_score;
          const index = row.index;

          return (
            <div className="font-medium text-center">
              {score > 0 ? `${index + 1}º` : "--"}
            </div>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: () => <div className="text-center">Nome</div>,
        cell: (info) => (
          <div className="font-medium text-center">
            {info.getValue().replace(/ D([aeiou]s?) /g, " d$1 ")}
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: () => <div className="text-center">Categoria</div>,
        cell: (info) => (
          <div className="font-medium text-center capitalize">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("productions", {
        header: () => <div className="text-center">Publicações</div>,
        cell: (info) => (
          <div className="font-medium text-center">
            <Button
              variant="ghost"
              className="hover:bg-transparent h-full"
              onClick={() => onShowDetails(info.row.original.user_id)}
            >
              <BookOpenTextIcon className="size-5" />
            </Button>
          </div>
        ),
      }),
      columnHelper.accessor("total_score", {
        header: () => <div className="font-medium text-center">Pontuação</div>,
        cell: (info) => (
          <div className="font-medium text-center">
            {info.getValue().toFixed(1)}
          </div>
        ),
      }),
      columnHelper.accessor("lattes_url", {
        header: () => <div className="text-center">Lattes</div>,
        cell: (info) => (
          <div className="font-medium text-center">
            <Link
              to={info.row.original.lattes_url}
              target="_blank"
              className="flex justify-center"
            >
              <LattesIcon />
            </Link>
          </div>
        ),
      }),
    ],
    [onShowDetails],
  );

  return (
    <>
      {/* Cards - Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {ranking.map((rank, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              rank.total_score >= 250
                ? "bg-green-50 border-green-200"
                : "bg-card"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">
                  {index + 1}º
                </span>
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-semibold text-left justify-start hover:underline hover:bg-transparent"
                    onClick={() => onShowDetails(rank.user_id)}
                  >
                    {rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}
                  </Button>
                  <span className="text-sm text-muted-foreground capitalize">
                    {rank.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Pontuação</span>
                <span className="text-xl font-bold">
                  {rank.total_score.toFixed(1)}
                </span>
              </div>
              <Link
                to={rank.lattes_url}
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <LattesIcon className="h-4 w-4" />
                <span>Lattes</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={ranking}
        isLoading={isLoading}
        emptyMessage="Não foram encontrados professores"
        getRowClassName={(row) =>
          row.original.total_score >= 250
            ? "font-medium bg-green-100/50 hover:bg-green-100/80 transition-colors"
            : "bg-red-50/50 hover:bg-red-50/80 transition-colors"
        }
      />
    </>
  );
}
