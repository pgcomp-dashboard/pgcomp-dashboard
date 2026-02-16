import UploadXMLForm from '@/features/productions/components/UploadXMLForm';

export default function WelcomePage() {
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
