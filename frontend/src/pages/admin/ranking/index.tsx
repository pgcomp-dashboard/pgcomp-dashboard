'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { ToggleLeft, ToggleLeftIcon, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

type Ranking = {
  name: string;
  category: string;
  lattes_url: string;
  score: number;
}

export default function RankingPage() {

  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

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
      <div className='flex justify-between'>
        <div className='flex gap-2'>
        <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
        <Button onClick={() => window.open('http://wwws.cnpq.br/cvlattesweb/pkg_login.oauth2_redirect')}>
          <h1 className="font-bold tracking-tight float-left">Editar Lattes</h1>
          </Button>
        </div>
        <div>
          <Label>Permanentes</Label>
          <Button onClick={handleToggle} className=''>
          {isToggled ? <ToggleRight /> : <ToggleLeft />}
        </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema no ultimo ano.
      </p>
      {/* Tabela */}
      <div className="float-left rounded-md border md:w-1/2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colocação</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((rank, index) => (
                !isToggled ?
                <TableRow className={rank.score >= 250 ?'font-medium bg-green-100 hover:bg-green-200' : '' }key={index}>
                <TableCell className="font-medium">{index + 1}º</TableCell>
                <TableCell className="font-medium"><Link to={rank.lattes_url} target="_blank">{rank.name}</Link></TableCell>
                <TableCell className="font-medium">
                  {rank.category}
                </TableCell>
                <TableCell className="font-medium float-left">
                  {rank.score.toFixed(1)}
                </TableCell>
                </TableRow>
                : rank.category == 'permanente' ?
                <TableRow className={rank.score >= 250 ?'font-medium bg-green-100 hover:bg-green-200' : '' }key={index}>
                <TableCell className="font-medium">{index + 1}º</TableCell>
                <TableCell className="font-medium"><Link to={rank.lattes_url} target="_blank">{rank.name}</Link></TableCell>
                <TableCell className="font-medium">
                  {rank.category}
                </TableCell>
                <TableCell className="font-medium float-left">
                  {rank.score.toFixed(1)}
                </TableCell>
                  </TableRow> : null
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
