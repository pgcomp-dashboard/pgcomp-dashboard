import UploadXMLForm from '@/features/productions/components/UploadXMLForm';
import useAuth from '@/hooks/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { configurationService } from '@/services/modules/configuration.service';
import { AlertTriangle, Clock } from 'lucide-react';

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
          <p className="text-muted-foreground">
            Bem vindo(a) ao portal do PGCOMP dashboard
          </p>
        </div>
        <div className="flex flex-wrap justify-center">
          <UploadXMLForm />
        </div>
      </div>
    </div>
  );
}
