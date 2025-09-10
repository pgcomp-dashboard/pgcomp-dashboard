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

export default function RankingPage() {

  const {
    data,
    isLoading,
    error,
  } = useQuery<Ranking[] , Error>({
    queryKey: [ 'ranking' ],
    queryFn: () =>
      api.getRanking(),
    placeholderData: (prevData) => prevData,
  });

  const ranking = data ?? [];

  // async function fetchRanking() {
  //   try {
  //     const response = await api.getRanking();
  //     setRanking(response);
  //   } catch (err) {
  //     console.error('Erro ao carregar Ranking:', err);
  //   }
  // }

  // useEffect(() => {
  //   fetchRanking();
  // }, []);

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar ranking!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
      <p className="text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema.
      </p>
      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-center">Nome</TableHead>
              <TableHead className="text-right">Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((rank, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index+1}º</TableCell>
                <TableCell className="font-medium text-center">{rank.name}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  {rank.score}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
