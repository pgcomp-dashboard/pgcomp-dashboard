import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StratumQualis } from "@/types/academic";
import { useEffect, useState } from "react";
import { QualisFormData } from "../hooks/useQualis";

interface QualisDialogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: StratumQualis | null;
  onSubmit: (data: QualisFormData) => Promise<void>;
}

const initialFormData: QualisFormData = {
  type: "",
  code: "",
  score: 0,
};

export function QualisDialog({
  isOpen,
  onOpenChange,
  editingItem,
  onSubmit,
}: QualisDialogsProps) {
  const [formData, setFormData] = useState<QualisFormData>(initialFormData);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        type: editingItem.type,
        code: editingItem.code,
        score: editingItem.score,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingItem, isOpen]);

  const handleValueChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? parseFloat(value.toString()) : value,
    }));
  };

  const handleFormSubmit = async () => {
    if (!formData.type || !formData.code) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Editar Qualis" : "Adicionar Qualis"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleValueChange("code", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="score">Score</Label>
            <Input
              type="number"
              id="score"
              value={formData.score}
              onChange={(e) => handleValueChange("score", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleValueChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="journal">Revista</SelectItem>
                <SelectItem value="conference">Conferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleFormSubmit}>
          {editingItem ? "Atualizar" : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
