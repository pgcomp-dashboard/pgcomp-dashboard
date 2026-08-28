import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface UserAdminRequestFormProps {
  status: 'pending' | 'approved' | 'rejected' | null | undefined;
  isLoading: boolean;
  error: Error | null;
  onRequest: () => void;
  isRequesting: boolean;
}

export function UserAdminRequestForm({
  status,
  isLoading,
  error,
  onRequest,
  isRequesting,
}: UserAdminRequestFormProps) {
  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Verificando solicitação...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 flex items-center p-10">
        <AlertCircle className="mr-2" /> Erro ao carregar dados.
      </div>
    );

  const statusConfig = {
    pending: {
      title: 'Solicitação Pendente',
      titleColor: 'text-yellow-600',
      description: 'Você já solicitou acesso de administrador. Aguarde a aprovação de um administrador existente.',
      buttonText: 'Aguardando Aprovação',
      buttonVariant: 'outline' as const,
      disabled: true,
      action: null,
    },
    rejected: {
      title: 'Solicitação Rejeitada',
      titleColor: 'text-red-600',
      description: null,
      buttonText: isRequesting ? 'Solicitando...' : 'Solicitar Novamente',
      buttonVariant: 'default' as const,
      disabled: isRequesting,
      action: onRequest,
    },
    default: {
      title: null,
      description: 'Caso você precise de privilégios de administrador para gerenciar o sistema, clique no botão abaixo para solicitar a promoção.',
      buttonText: isRequesting ? 'Solicitando...' : 'Solicitar promoção para admin',
      buttonVariant: 'default' as const,
      disabled: isRequesting,
      action: onRequest,
    },
  };

  const currentKey = (status === 'pending' || status === 'rejected') ? status : 'default';
  const config = statusConfig[currentKey];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 items-center">
        {config.title && (
          <h4 className={`font-semibold ${config.titleColor || ''}`}>
            {config.title}
          </h4>
        )}

        {config.description && (
          <p className="text-sm text-muted-foreground text-center">
            {config.description}
          </p>
        )}

        <Button
          onClick={config.action || undefined}
          disabled={config.disabled}
          variant={config.buttonVariant}
        >
          {config.buttonText}
        </Button>
      </div>
    </div>
  );
}
