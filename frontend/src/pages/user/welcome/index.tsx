import UploadXMLForm from '@/features/productions/components/UploadXMLForm';
import useAuth from '@/hooks/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { configurationService } from '@/services/modules/configuration.service';
import { AlertTriangle, Clock, CalendarDays, CalendarIcon, Flag, RefreshCcw } from 'lucide-react';

export default function WelcomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const { data: configurations } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => configurationService.getAll(),
  });

  const accreditationConfig = configurations?.find(
    (c) => c.group === "accreditation" && c.key === "rules"
  );

  const isMaintenanceMode = accreditationConfig?.casted_value?.is_maintenance_mode ?? false;

  const importantDatesConfig = configurations?.find(
    (c) => c.group === "accreditation" && c.key === "important_dates"
  );

  const importantDates = importantDatesConfig?.casted_value || null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return '-';
    return `${day}/${month}/${year}`;
  };

  const hasImportantDates = importantDates && (
    importantDates.lattes_deadline ||
    importantDates.adjustment_period_start ||
    importantDates.adjustment_period_end ||
    importantDates.final_result_deadline
  );

  useEffect(() => {
    if (auth?.isAuthenticated && !auth?.isAdmin && (auth?.user?.productions_count ?? 0) > 0) {
      navigate('/portal/productions');
    }
  }, [auth, navigate]);

  return (
    <div className="w-full space-y-8">
      {isMaintenanceMode && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <Clock className="h-8 w-8" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl font-bold text-amber-900 flex items-center justify-center md:justify-start gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sistema em Manutenção
            </h2>
            <p className="text-amber-800">
              Estamos realizando manutenção no sistema. O portal estará disponível em breve. Agradecemos a compreensão.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            PGCOMP é CAPES 6!
          </h1>
          <p className="text-muted-foreground mt-2">
            Bem vindo(a) ao portal do PGCOMP dashboard
          </p>
        </div>

        {hasImportantDates && (
          <div className="w-full max-w-2xl bg-card border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="bg-primary/5 border-b p-3 flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary">Calendário de Credenciamento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
              <div className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-xs text-muted-foreground">Envio do XML Lattes</h3>
                <p className="text-sm font-semibold text-foreground">
                  Até {formatDate(importantDates.lattes_deadline)}
                </p>
              </div>

              <div className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                  <RefreshCcw className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-xs text-muted-foreground">Ajuste de Pontuação</h3>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(importantDates.adjustment_period_start)} a {formatDate(importantDates.adjustment_period_end)}
                </p>
              </div>

              <div className="p-4 flex flex-col items-center text-center gap-1.5">
                <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1">
                  <Flag className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-xs text-muted-foreground">Resultado Final</h3>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(importantDates.final_result_deadline)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center mt-4">
          <UploadXMLForm />
        </div>
      </div>
    </div>
  );
}
