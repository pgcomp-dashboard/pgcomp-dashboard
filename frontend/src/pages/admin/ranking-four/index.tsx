'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/api';
import { useQuery } from '@tanstack/react-query';

type Ranking = {
  name: string;
  score: number;
}

export default function RankingFourPage() {

  const date = new Date();
  const {
    data,
    isLoading,
    error,
  } = useQuery<Ranking[] , Error>({
    queryKey: [ 'ranking' ],
    queryFn: () =>
      api.getRanking(date.getFullYear() - 4, date.getFullYear()),
    placeholderData: (prevData) => prevData,
  });

  const ranking = data ?? [];

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar ranking!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
      <p className="text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema nos ultimos 4 anos.
      </p>
      {/* Tabela */}
      <div className="float-left rounded-md border md:w-1/2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colocação</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((rank, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index+1}º</TableCell>
                <TableCell className="font-medium">{rank.name}</TableCell>
                <TableCell className="text-right flex">
                  {rank.score.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
