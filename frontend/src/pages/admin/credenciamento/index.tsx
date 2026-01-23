'use client';

import LattesIcon from '@/components/LattesIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Switch from '@mui/material/Switch';
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
import { BookOpenTextIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

type Ranking = {
  user_id: number,
  name: string;
  category: string;
  total_score: number;
  lattes_url: string;
  productions: Production[];
}

type Production = {
  production_id: number;
  title: string;
  year: number;
  publisher_type: string;
  code: string;
  score: number;
}

type RankingProps = {
  rankerList: Ranking[]
}

export default function CredenciamentoPage() {
  const date = new Date();

  const [isToggled, setIsToggled] = useState(false);
  //const [selectedRanker, setSelectedRanker] = useState<Ranking | undefined>(undefined);
  //const [showingProductions, setShowingProductions] = useState<Production[] | undefined>(undefined)

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
      api.getRankingProductionsOfUser(date.getFullYear() - 4, date.getFullYear() - 1),
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

  //console.log(data)

  return (
    <div className="flex flex-col gap-4">
      <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start'>
        <Link to="/" className='md:hidden' >
          <Button variant="outline" className='self-start md:self-auto'>Voltar ao Dashboard</Button>
        </Link>
        <div className='flex flex-row justify-between gap-2 sm:flex-row sm:gap-2 sm:items-center w-full'>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Credenciamento</h1>
          <div className='flex flex-row gap-2 md:gap-4 items-center justify-end'>
            <Label className="text-xs md:text-sm">Mostrar Todos</Label>
            <Switch checked={isToggled} onChange={handleToggle} size="medium" color="primary" />
          </div>
        </div>

      </div>
      <p className="text-sm sm:text-base text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema.
        Pela <Link to="https://pgcomp.ufba.br/sites/pgcomp.ufba.br/files/2022_resolucao_05_-_credenciamento_de_docentes.pdf" target='_blank' className="underline"> Resolução</Link> são considerados os ultimos 4 anos completos.
        Para o calculo estão sendo considerados as produções de {date.getFullYear() - 4} até {date.getFullYear() - 1}
      </p>

      {/* Tabela - Desktop */}
      <div className="hidden md:block rounded-md border w-full">
        <Table>
          {!isToggled ?
            <ShowRanking rankerList={ranking.filter((rank) => rank.category == 'permanente')} />
            :
            <ShowRanking rankerList={ranking} />
          }
        </Table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {!isToggled ?
          <ShowRankingCards rankerList={ranking.filter((rank) => rank.category == 'permanente')} />
          :
          <ShowRankingCards rankerList={ranking} />
        }
      </div>
    </div>
  );
}

function ShowRanking({ rankerList }: RankingProps) {
  const [isProductionsOpen, setIsProductionsOpen] = useState(false)
  const [currentProductionList, setCurrentProductionList] = useState<Production[] | null>(null)

  return (
    <>
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
        {rankerList ?
          rankerList.map((rank, index) => (
            <TableRow className={rank.total_score >= 250 ? 'font-medium bg-green-100 hover:bg-green-200' : 'bg-red-50'} key={index}>
              <TableCell className="font-medium text-center">{index + 1}º</TableCell>
              <TableCell className="font-medium text-center">
                <Button variant='ghost' className='hover:bg-transparent' onClick={() => {
                  setCurrentProductionList(rank.productions)
                  setIsProductionsOpen(true)
                }}>{rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}</Button>
              </TableCell>
              <TableCell className="font-medium text-center">{rank.category.replace(/^./, (match) => match.toUpperCase())}</TableCell>
              <TableCell className="font-medium text-center">
                <Button variant='ghost' className='hover:bg-transparent h-full' onClick={() => {
                  setCurrentProductionList(rank.productions)
                  setIsProductionsOpen(true)
                }}> <BookOpenTextIcon className="size-6" /></Button>
              </TableCell>
              <TableCell className="font-medium     text-center">{rank.total_score.toFixed(1)}</TableCell>
              <TableCell className="font-medium text-center">
                <Link to={rank.lattes_url} target="_blank" className='flex justify-center'>
                  <LattesIcon />
                </Link>
              </TableCell>
            </TableRow>
          )) : null}
      </TableBody>

      <Dialog open={isProductionsOpen} onOpenChange={setIsProductionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produções Consideradas</DialogTitle>
            <DialogDescription>Visualizar produçoes consideradas na pontuação. Caso queira mais detalhes sobre suas produções vá a aba Minhas Produções</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {currentProductionList ? (
              currentProductionList.map((production, index) => (
                <div key={index}
                  className="rounded border bg-gray-100 p-4 text-sm flex flex-col gap-1">
                  <p><strong>Título da Produção:</strong> {production.title}</p>
                  <p><strong>Ano:</strong> {production.year}</p>
                  <p><strong>Qualis:</strong> {production.code ? production.code : "Não encontrado"}</p>
                  <p><strong>Pontuação:</strong> {production.score ? production.score : 0}</p>
                  <p><strong>Tipo de Publicação:</strong> {production.publisher_type ? production.publisher_type : "Não encontrado"}</p>
                </div>
              ))
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProductionsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente de Cards para Mobile
function ShowRankingCards({ rankerList }: RankingProps) {
  const [ isProductionsOpen, setIsProductionsOpen ] = useState(false);
  const [ currentProductionList, setCurrentProductionList ] = useState<Production[] | null>(null);

  return (
    <>
      {rankerList.map((rank, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 ${
            rank.total_score >= 250
              ? 'bg-green-50 border-green-200'
              : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{index + 1}º</span>
              <div className="flex flex-col">
                <Button
                  variant='ghost'
                  className={`p-0 h-auto font-semibold text-left justify-start hover:underline ${
                    rank.total_score >= 250 ? 'hover:bg-transparent' : ''
                  }`}
                  onClick={() => {
                    setCurrentProductionList(rank.productions);
                    setIsProductionsOpen(true);
                  }}
                >
                  {rank.name.replace(/ D([aeiou]s?) /g, ' d$1 ')}
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
              <span className="text-xl font-bold">{rank.total_score.toFixed(1)}</span>
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

      <Dialog open={isProductionsOpen} onOpenChange={setIsProductionsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Produções Consideradas</DialogTitle>
            <DialogDescription>Visualizar produçoes consideradas na pontuação. Caso queira mais detalhes sobre suas produções vá a aba Minhas Produções</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {currentProductionList ? (
              currentProductionList.map((production, index) => (
                <div key={index}
                  className="rounded border bg-gray-100 p-4 text-sm flex flex-col gap-1">
                  <p><strong>Título da Produção:</strong> {production.title}</p>
                  <p><strong>Ano:</strong> {production.year}</p>
                  <p><strong>Qualis:</strong> {production.code ? production.code : 'Não encontrado'}</p>
                  <p><strong>Pontuação:</strong> {production.score ? production.score : 0}</p>
                  <p><strong>Tipo de Publicação:</strong> {production.publisher_type ? production.publisher_type : 'Não encontrado'}</p>
                </div>
              ))
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProductionsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
