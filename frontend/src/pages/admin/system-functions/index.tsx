import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LATTES_XML_UPLOAD_QUERY_KEY } from '@/features/system-functions/hooks/useLattesXmlUploadAvailability';
import { systemFunctionService } from '@/services/modules/system-function.service';
import { parseApiError } from '@/services/http-client';

export default function SystemFunctionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [ 'admin-system-functions' ],
    queryFn: () => systemFunctionService.getAdminFunctions(),
  });

  const updateFunction = useMutation({
    mutationFn: (enabled: boolean) =>
      systemFunctionService.updateLattesXmlUpload(enabled),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [ 'admin-system-functions' ],
        }),
        queryClient.invalidateQueries({
          queryKey: LATTES_XML_UPLOAD_QUERY_KEY,
        }),
      ]);
      toast.success('Função do sistema atualizada.');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar a função: ${parseApiError(error)}`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings2 className="h-8 w-8 text-primary" />
          Funções do sistema
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ative ou desative funções disponíveis para os usuários.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Função</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ativar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">
                  Erro ao carregar as funções do sistema.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((systemFunction) => (
                <TableRow key={systemFunction.key}>
                  <TableCell className="font-medium">
                    {systemFunction.name}
                  </TableCell>
                  <TableCell>{systemFunction.description}</TableCell>
                  <TableCell>
                    {systemFunction.enabled ? 'Ativa' : 'Desativada'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      aria-label={`${systemFunction.enabled ? 'Desativar' : 'Ativar'} ${systemFunction.name}`}
                      checked={systemFunction.enabled}
                      disabled={updateFunction.isPending}
                      onCheckedChange={(enabled) =>
                        updateFunction.mutate(enabled)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
