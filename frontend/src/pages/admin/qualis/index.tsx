import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

type Qualis = {
  id: number;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
}

interface RequestBodyType {
  code: string;
  score: number;
}

export default function QualisPage() {
  const [ qualisData, setQualisData ] = useState<Qualis[]>([]);
  const [ editingItem, setEditingItem ] = useState<Qualis | null>(null);
  const [ formData, setFormData ] = useState({
    code: '',
    score: 0,
  });

  async function fetchQualisData() {
    try {
      const data = await api.getAllQualis();
      setQualisList(data);
    } catch (error) {
      console.error('Erro ao buscar os dados do Qualis:', error);
    }
  }

  const handleEdit = (item: Qualis) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      score: item.score,
    });
  };

  const handleSubmit = async () => {
    try {
      const parsedScore = parseFloat(formData.score.toString());
      if (isNaN(parsedScore)) {
        console.error("Score inválido");
        return;
      }

      const payload: RequestBodyType = {
        code: formData.code,
        score: parsedScore,
      };

      if (editingItem) {
        await api.updateQualis(editingItem.id, JSON.stringify(payload));
      } else {
        await api.createQualis(JSON.stringify(payload));
      }

      await fetchQualisData();
      setEditingItem(null);
      setFormData({ code: '', score: 0 });
    } catch (error) {
      console.error("Erro ao salvar Qualis:", error);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'score' ? parseFloat(value) : value,
    }));
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({ code: '', score: 0 });
  };

  useEffect(() => {
    fetchQualisData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Qualis</h3>
          <p className="text-muted-foreground">Gerencie os qualis cadastrados no sistema.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Qualis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block">Código</label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="score" className="block">Score</label>
                <Input
                  type="number"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                />
              </div>
              <Button onClick={handleSubmit}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar qualis..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <br />

      {/* Formulário de edição (fora do modal) */}
      {editingItem && (
        <div className="mb-6 p-4 border rounded-md">
          <h4 className="text-md font-semibold mb-2">Editar Qualis</h4>
          <div className="mb-4">
            <label htmlFor="code" className="block">Código</label>
            <Input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="score" className="block">Score</label>
            <Input
              type="number"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleChange}
            />
          </div>
          <Button variant="default" onClick={handleSubmit}>
            Atualizar
          </Button>
          <Button variant="secondary" onClick={handleCancel} className="ml-2">Cancelar</Button>
        </div>
      )}

      {/* Tabela de Qualis */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Pontuação</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQualisCode.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.score}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{new Date(item.updated_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                        Apagar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
