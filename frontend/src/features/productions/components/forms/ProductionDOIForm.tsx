import { queryClient } from '@/lib/query-client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { productionService } from '@/services/modules/production.service';
import { extractDoiCode } from '@/utils/doi';

interface ProductionDOIFormProps {
  professorId?: string;
  onSuccess?: () => void;
}

export function ProductionDOIForm({ professorId, onSuccess }: ProductionDOIFormProps) {
  const [ doi, setDoi ] = useState<string>('');
  const [ publisherType, setPublisherType ] = useState('conference');
  const [ isLoading, setIsLoading ] = useState(false);

  async function createProduction() {
    if (!doi) return;

    setIsLoading(true);
    const request = {
      type: publisherType,
      doi: extractDoiCode(doi),
    };

    try {
      if (professorId && professorId !== 'own') {
        await productionService.createProfessorProductionFromDoi(Number(professorId), request);
      } else {
        await productionService.createProductionFromDoi(request);
      }

      toast.success('Criado com sucesso');
      setDoi('');
      await queryClient.invalidateQueries({ queryKey: ['productions', professorId || 'own'] });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Erro ao criar produção');
      console.error('Erro ao criar produção:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col w-full max-w-md gap-4 items-center">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Adicionar com DOI</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importe a produção pelo identificador DOI
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Tipo de publicação</Label>
            <RadioGroup
              className="flex gap-4"
              defaultValue="conference"
              onValueChange={setPublisherType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conference" id="doi-conference" />
                <Label htmlFor="doi-conference" className="font-normal cursor-pointer">
                  Conferência
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="journal" id="doi-journal" />
                <Label htmlFor="doi-journal" className="font-normal cursor-pointer">
                  Revista
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">DOI</Label>
            <Input
              placeholder="Ex: 10.1000/xyz123"
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
          </div>

          <Button
            onClick={createProduction}
            disabled={!doi || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Importando...' : 'Importar produção'}
          </Button>
        </div>
      </div>
    </div>
  );
}
