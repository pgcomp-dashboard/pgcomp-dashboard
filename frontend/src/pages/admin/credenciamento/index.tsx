'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Paperclip } from 'lucide-react';
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
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
          <Button onClick={() => window.open('http://wwws.cnpq.br/cvlattesweb/pkg_login.oauth2_redirect')}>
            <h1 className="font-bold tracking-tight float-left">Editar Lattes</h1>
          </Button>
        </div>
        <div className='flex gap-4 items-center'>
          <Label>Permanentes</Label>
          <Switch onCheckedChange={handleToggle} />
        </div>
      </div>
      <p className="text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema.
        Pela <Link to="https://pgcomp.ufba.br/sites/pgcomp.ufba.br/files/2022_resolucao_05_-_credenciamento_de_docentes.pdf" target='_blank'> Resolução</Link> são considerados os ultimos 4 anos completos.
        Para o calculo estão sendo considerados as produções de {date.getFullYear() - 4} até {date.getFullYear() - 1}
      </p>
      {/* Tabela */}
      <div className="float-left rounded-md border w-full md:w-1/2">
        <Table>
          {!isToggled ?
            <ShowRanking rankerList={ranking} />
            :
            <ShowRanking rankerList={ranking.filter((rank) => rank.category == 'permanente')} />
          }
        </Table>
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
          <TableHead>Colocação</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Pontuação</TableHead>
          <TableHead>Lattes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankerList ?
          rankerList.map((rank, index) => (
            <TableRow className={rank.total_score >= 250 ? 'font-medium bg-green-100 hover:bg-green-200' : ''} key={index}>
              <TableCell className="font-medium">{index + 1}º</TableCell>
              <TableCell className="font-medium">
                <Button variant='ghost' className={rank.total_score >= 250 ? 'hover:bg-green-200' : 'hover:bg-transparent'} onClick={() => {
                  setCurrentProductionList(rank.productions)
                  setIsProductionsOpen(true)
                }}>{rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}</Button>
              </TableCell>
              <TableCell className="font-medium">{rank.category.replace(/^./, (match) => match.toUpperCase())}</TableCell>
              <TableCell className="font-medium">{rank.total_score.toFixed(1)}</TableCell>
              <TableCell className="font-medium">
                <Link to={rank.lattes_url} target="_blank">
                  <Paperclip />
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
