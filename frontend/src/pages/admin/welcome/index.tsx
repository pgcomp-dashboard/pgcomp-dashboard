import UploadXMLForm from "@/components/UploadXMLForm";
import WelcomeImage from "@/components/WelcomeImage";

export default function WelcomePage() {

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-between gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight">PGCOMP é CAPES 6!</h1>
          <p className="text-muted-foreground">Bem vindo(a) ao portal do pgcomp dashboard</p>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full lg:w-1/2">
            <UploadXMLForm />
          </div>
          <div className="w-full lg:w-1/2">
            <WelcomeImage className="rounded-md border w-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
