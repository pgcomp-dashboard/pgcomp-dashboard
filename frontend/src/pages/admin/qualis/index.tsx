import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { qualisService } from "@/services/modules/qualis.service";
import { StratumQualis } from "@/types/academic";
import { ApiError } from "@/types/common";
import { SelectValue } from "@radix-ui/react-select";
import { Pencil, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RequestBodyType {
  type: string;
  code: string;
  score: number;
}

export default function QualisPage() {
  const [qualisList, setQualisList] = useState<StratumQualis[]>([]);
  const [formData, setFormData] = useState<RequestBodyType>({
    type: "",
    code: "",
    score: 0,
  });
  const [editingItem, setEditingItem] = useState<StratumQualis | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQualisCode = qualisList.filter((s) =>
    s.code.toLowerCase().startsWith(searchTerm.trim().toLowerCase()),
  );

  async function fetchQualisData() {
    try {
      const data = await qualisService.getAllQualis();
      setQualisList(data);
      console.log(qualisList);
    } catch (error) {
      console.error("Erro ao buscar os dados do Qualis:", error);
    }
  }

  const handleEdit = (item: StratumQualis) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
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
        type: formData.type,
        code: formData.code,
        score: parsedScore,
      };

      if (editingItem) {
        await qualisService.updateQualis(
          editingItem.id,
          payload,
        );
      } else {
        await qualisService.createQualis(payload);
      }

      await fetchQualisData();
      setEditingItem(null);
      setFormData({ type: "", code: "", score: 0 });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erro ao salvar Qualis:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValueChange(e.target.name, e.target.value);
  };

  const handleValueChange = (name: string, value: string | number) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "score" ? parseFloat(value.toString()) : value,
    }));
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ type: "", code: "", score: 0 });
    setIsAddOpen(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({ type: "", code: "", score: 0 });
  };

  useEffect(() => {
    fetchQualisData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await qualisService.deleteQualis(id);
      await fetchQualisData();

      toast.success("Qualis deletado com sucesso!");
    } catch (e: unknown) {
      const error = e as ApiError;

      toast.error(error.errors[0].description);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Qualis</h3>
          <p className="text-muted-foreground">
            Gerencie os qualis cadastrados no sistema.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Qualis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code" className="block">
                  Código
                </Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="score" className="block">
                  Score
                </Label>
                <Input
                  type="number"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="score" className="block">
                    Tipo
                  </Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleValueChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal">Revista</SelectItem>
                      <SelectItem value="conference">Conferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSubmit}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar qualis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <br />

      {/* Formulário de edição (fora do modal) */}
      {editingItem && (
        <div className="mb-6 p-4 border rounded-md">
          <h4 className="text-md font-semibold mb-2">Editar Qualis</h4>
          <div className="mb-4">
            <label htmlFor="code" className="block">
              Código
            </label>
            <Input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="score" className="block">
              Score
            </label>
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
          <Button variant="secondary" onClick={handleCancel} className="ml-2">
            Cancelar
          </Button>
        </div>
      )}

      {/* Tabela de Qualis */}

      <Accordion type="multiple">
        <AccordionItem value="journal">
          <AccordionTrigger>Qualis das produções de revistas</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQualisCode
                    .filter((item) => item.type === "journal")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.code}</TableCell>
                        <TableCell>{item.score.toFixed(1)}</TableCell>
                        <TableCell>
                          {new Date(item.updated_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            aria-label="Editar"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 cursor-pointer"
                            aria-label="Apagar"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="conference">
          <AccordionTrigger>
            Qualis das produções de conferências
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQualisCode
                    .filter((item) => item.type === "conference")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.code}</TableCell>
                        <TableCell>{item.score.toFixed(1)}</TableCell>
                        <TableCell>
                          {new Date(item.updated_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            aria-label="Editar"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 cursor-pointer"
                            aria-label="Apagar"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
