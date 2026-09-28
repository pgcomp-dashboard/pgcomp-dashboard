import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import { Link, useLocation } from "react-router";

export default function StudentRegistrationSentPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link to="/" aria-label="Página inicial">
            <AppLogo className="w-30" />
          </Link>

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MailCheck className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-medium sm:text-xl">
              Verifique seu e-mail
            </h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link para definir sua senha
              {email ? (
                <>
                  {" "}
                  para{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : null}
              . Abra a mensagem para concluir o cadastro.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
