import LattesIcon from "@/components/LattesIcon";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ranking } from "@/types/academic";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { BookOpenTextIcon, Info } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

interface AccreditationTableProps {
  ranking: Ranking[];
  isLoading: boolean;
  startYear: number;
  endYear: number;
}

const columnHelper = createColumnHelper<Ranking>();

// Helper for name formatting
const formatName = (name: string) =>
  name.replace(/ D([aeiou]s?) /g, " d$1 ");

export function AccreditationTable({
  ranking,
  isLoading,
  startYear,
  endYear,
}: AccreditationTableProps) {
  const navigate = useNavigate();

  const handleShowDetails = (userId: number) => {
    navigate(`/portal/productions?professorId=${userId}&initialYear=${startYear}&finalYear=${endYear}`);
  };

  const columns = useMemo<ColumnDef<Ranking, any>[]>(
    () => [
      columnHelper.display({
        id: "colocacao",
        header: "Colocação",
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
        header: "Nome",
        cell: (info) => (
          <div className="font-medium text-center">
            {formatName(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Categoria",
        cell: (info) => (
          <div className="font-medium text-center capitalize">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("productions", {
        header: "Publicações",
        cell: (info) => (
          <div className="font-medium text-center">
            <Button
              variant="ghost"
              className="hover:bg-transparent h-full"
              onClick={() => handleShowDetails(info.row.original.user_id)}
            >
              < BookOpenTextIcon className="size-5" />
            </Button>
          </div>
        ),
      }),
      columnHelper.display({
        id: "periodicos",
        header: "#Periódicos",
        cell: ({ row }) => {
          const breakdown = row.original.qualis_breakdown || {};
          const sortedKeys = Object.keys(breakdown).sort();

          return (
            <div className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="p-3">
                    <div className="space-y-1">
                      <p className="font-semibold border-b pb-1 mb-1">Detalhamento</p>
                      {sortedKeys.length > 0 ? (
                        sortedKeys.map(key => (
                          <div key={key} className="flex justify-between gap-4">
                            <span className="font-mono">{key}:</span>
                            <span className="font-bold">{breakdown[key]}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic">Sem publicações no período</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      }),
      columnHelper.accessor("pq", {
        header: "PQ",
        cell: (info) => (
          <div className="font-medium text-center">
            {info.getValue() ? (
              <span className="text-primary font-bold">Sim</span>
            ) : (
              <span className="text-muted-foreground">Não</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("is_senior", {
        header: "Sênior",
        cell: (info) => (
          <div className="font-medium text-center">
            {info.getValue() ? (
              <span className="text-blue-600 font-bold">Sim</span>
            ) : (
              <span className="text-muted-foreground">Não</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("total_score", {
        header: "Pontuação",
        cell: (info) => (
          <div className="font-bold text-center">
            {info.getValue().toFixed(1)}
          </div>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const { is_accredited, reasons } = row.original;
          return (
            <div className="flex justify-center">
              {is_accredited ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Credenciável
                </span>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Não Credenciável
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold text-red-600">Motivos:</p>
                        <ul className="list-disc list-inside text-xs">
                          {reasons?.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("lattes_url", {
        header: "Lattes",
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
    [handleShowDetails],
  );

  const renderMobileCard = (row: Row<Ranking>) => {
    const rank = row.original;
    const index = row.index;
    const breakdown = rank.qualis_breakdown || {};
    const sortedKeys = Object.keys(breakdown).sort();

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">
              {index + 1}º
            </span>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                className="p-0 h-auto font-semibold text-left justify-start hover:underline hover:bg-transparent"
                onClick={() => handleShowDetails(rank.user_id)}
              >
                {formatName(rank.name)}
              </Button>
              <span className="text-sm text-muted-foreground capitalize">
                {rank.category}
                {rank.pq && <span className="text-primary font-black ml-1">• PQ</span>}
                {rank.is_senior && <span className="text-blue-600 font-black ml-1">• Sênior</span>}
              </span>
            </div>
          </div>
          {rank.is_accredited ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
              Credenciado
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
              Não Credenciado
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center justify-between border-b pb-2 mb-1">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pontuação Total</span>
            <span className="text-lg font-black text-primary">{rank.total_score.toFixed(1)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Detalhamento Qualis</p>
            <div className="grid grid-cols-3 gap-2">
              {sortedKeys.length > 0 ? (
                sortedKeys.map(key => (
                  <div key={key} className="flex flex-col items-center bg-background rounded border p-1 border-border/40">
                    <span className="text-[10px] font-mono text-muted-foreground">{key}</span>
                    <span className="text-xs font-bold">{breakdown[key]}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground col-span-3">Nenhuma publicação</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
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
    );
  };

  return (
    <DataTable
      columns={columns}
      data={ranking}
      isLoading={isLoading}
      emptyMessage="Não foram encontrados professores"
      getRowClassName={(row) =>
        row.original.is_accredited
          ? "font-medium bg-green-50/20 hover:bg-green-50/40 transition-colors"
          : "bg-red-50/20 hover:bg-red-50/40 transition-colors"
      }
      pagination={{
        pageIndex: 0,
        pageSize: 1000,
      }}
      renderMobileCard={renderMobileCard}
    />
  );
}
