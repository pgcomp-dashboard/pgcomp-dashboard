import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/auth';
import { Clock, LogOut } from 'lucide-react';
import { Link } from 'react-router';

export default function WaitingApprovalPage() {
  const auth = useAuth();

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="mb-4 sm:mb-8 flex items-center justify-center">
                <AppLogo />
              </div>
            </Link>

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="space-y-1 sm:space-y-2 text-center">
              <h1 className="text-lg sm:text-xl font-medium">Aguardando Aprovação</h1>
              <p className="text-muted-foreground text-center text-xs sm:text-sm px-4">
                Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador.
                Você receberá um e-mail assim que seu acesso for liberado.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => auth?.logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da conta
            </Button>

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Dúvidas? Entre em contato com um administrador
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
