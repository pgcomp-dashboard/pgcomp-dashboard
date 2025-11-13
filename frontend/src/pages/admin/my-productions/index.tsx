'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { FileText } from 'lucide-react';
import { useState } from 'react';

type Professor = {
  id: number;
  name: string;
  siape: number;
  email: string;
  lattes_url: string;
};

type StratumQualis = {
  id: number;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
};

type Production = {
  id: number;
  title: string;
  year: number;
  created_at: string;
  updated_at: string;
  publisher_type: string | null;
  publisher_id: number | null;
  last_qualis: string | null;
  stratum_qualis_id: number | null;
  sequence_number: number | null;
  doi: string | null;
  publisher: Publisher | null;
};

type Publisher = {
  id: number;
  initials: string | null;
  name: string;
  publisher_type: string;
  issn: string | null;
  percentile: string | null;
  update_date: string | null;
  tentative_date: string | null;
  logs: string | null;
  stratum_qualis_id: number | null;
  created_at: string;
  updated_at: string;
  stratum_qualis: StratumQualis | null;
};

interface RequestBodyType {
  title: string;
  year: number;
  last_qualis: string | null;
  doi: string | null;
}


export default function MyProductionsPage() {

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const [formData, setFormData] = useState<RequestBodyType>({ title: '', year: 0 , last_qualis: "xx", doi: "xxx"});

  const {
    data,
    isLoading,
    error,
  } = useQuery<Production[] , Error>({
    queryKey: [ 'productions' ],
    queryFn: () =>
      api.getProductionsByProfessor(2),
    placeholderData: (prevData) => prevData,
  });

  var entries
  if (data) {
    entries = Object.entries(data)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Production);
  }
  const productions = data ?? [];

  const handleSubmit = async () => {
    try {
      const parsedYear = parseFloat(formData.year.toString());
      if (isNaN(parsedYear)) {
        console.error('Ano Inválido');
        return;
      }

      const payload: RequestBodyType = {
        title: formData.title,
        year: formData.year,
        last_qualis: formData.last_qualis,
        doi: formData.doi
      };
      if (selectedProduction) {
        await api.updateQualis(selectedProduction.id, JSON.stringify(payload));
      }
    } catch (error) {
      console.error('Erro ao editar publicação:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'score' ? parseFloat(value) : value,
    }));
  };


  // const verProducoes = async (professorId: number) => {
  //   try {
  //     const rawProducoes = await api.getProductionsByProfessor(professorId);
  //     const entries = Object.entries(rawProducoes)
  //       .filter(([ key ]) => !isNaN(Number(key)))
  //       .map(([ , value ]) => value as unknown as Production);
  //     setSelectedProductions(entries);
  //     setIsProductionsOpen(true);
  //   } catch (error) {
  //     console.error(error);
  //     alert('Erro ao carregar produções do professor.');
  //   }
  // };

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar produções!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
    <h1 className="text-3xl font-bold tracking-tight">Minhas Produções</h1>
      <p className="text-muted-foreground">
        Visualize e edite suas produções.
      </p>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries?.map((production) => (
              <TableRow key={production.id}>
                <TableCell className="font-medium">{production.title}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduction(production)
                      setIsEditOpen(true)
                      }
                    }
                    title="Editar"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Dialog - Formulario de edição da produção */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edição</DialogTitle>
            <DialogDescription>Edite as informações da sua publicação</DialogDescription>
          </DialogHeader>
          {/* Formulario aqui */}
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            <p><strong>Título da Produção:</strong>
              <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.title}
                  onChange={handleChange}
                /></p>
                <p><strong>D.O.I.:</strong> <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.doi || "N/A"}
                  onChange={handleChange}
                /></p>
                <p><strong>Ano:</strong> <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.year}
                  onChange={handleChange}
                /></p>
                <p><strong>Ultima Qualis:</strong> <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.last_qualis || "N/A"}
                  onChange={handleChange}
                /></p>
                {selectedProduction?.publisher && (
                  <>
                    <p><strong>Local:</strong> {selectedProduction?.publisher.name}</p>
                    {selectedProduction?.publisher.initials && (
                      <p><strong>Sigla:</strong> {selectedProduction?.publisher.initials}</p>
                    )}
                    <p><strong>Tipo:</strong> {selectedProduction?.publisher.publisher_type}</p>
                    {selectedProduction?.publisher.issn && (
                      <p><strong>ISSN:</strong> {selectedProduction?.publisher.issn}</p>
                    )}
                  </>
                )}
                {selectedProduction?.publisher?.stratum_qualis && (
                  <p>
                    <strong>Qualis:</strong> {selectedProduction?.publisher.stratum_qualis.code}
                  </p>
                )}
              </div>
          <DialogFooter>
              <Button onClick={() => setIsEditOpen(false)}>Fechar</Button>
              <Button>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
