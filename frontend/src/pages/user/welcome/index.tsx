import UploadXMLForm from '@/features/productions/components/UploadXMLForm';
import useAuth from '@/hooks/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function WelcomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.isAuthenticated && !auth?.isAdmin && (auth?.user?.productions_count ?? 0) > 0) {
      navigate('/portal/productions');
    }
  }, [auth, navigate]);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-between gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            PGCOMP é CAPES 6!
          </h1>
          <p className="text-muted-foreground">
            Bem vindo(a) ao portal do PGCOMP dashboard
          </p>
        </div>
        <div className="flex flex-wrap">
          <UploadXMLForm />
        </div>
      </div>
    </div>
  );
}
