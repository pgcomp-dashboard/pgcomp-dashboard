import LattesIcon from "@/components/LattesIcon";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ranking } from "@/types/academic";
import { BookOpenTextIcon } from "lucide-react";
import { Link } from "react-router";

interface AccreditationTableProps {
  ranking: Ranking[];
  onShowDetails: (userId: number) => void;
}

export function AccreditationTable({ ranking, onShowDetails }: AccreditationTableProps) {
  return (
    <>
      {/* Tabela - Desktop */}
      <div className="hidden md:block rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Colocação</TableHead>
              <TableHead className="text-center">Nome</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Publicações</TableHead>
              <TableHead className="text-center">Pontuação</TableHead>
              <TableHead className="text-center">Lattes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((rank, index) => (
              <TableRow
                key={index}
                className={
                  rank.total_score >= 250
                    ? "font-medium bg-green-100/50 hover:bg-green-100/80 transition-colors"
                    : "bg-red-50/50 hover:bg-red-50/80 transition-colors"
                }
              >
                <TableCell className="font-medium text-center">
                  {rank.total_score > 0 ? `${index + 1}º` : "--"}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent"
                    onClick={() => onShowDetails(rank.user_id)}
                  >
                    {rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}
                  </Button>
                </TableCell>
                <TableCell className="font-medium text-center">
                  {rank.category ? rank.category.replace(/^./, (match) => match.toUpperCase()) : "Não encontrado"}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent h-full"
                    onClick={() => onShowDetails(rank.user_id)}
                  >
                    <BookOpenTextIcon className="size-5" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium text-center">
                  {rank.total_score.toFixed(1)}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Link
                    to={rank.lattes_url}
                    target="_blank"
                    className="flex justify-center"
                  >
                    <LattesIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {ranking.map((rank, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              rank.total_score >= 250 ? "bg-green-50 border-green-200" : "bg-card"
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
    </>
  );
}
