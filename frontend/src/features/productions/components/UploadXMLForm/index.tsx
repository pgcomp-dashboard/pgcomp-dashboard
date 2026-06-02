import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { queryClient } from "@/lib/query-client";
import { productionService } from "@/services/modules/production.service";
import { FileText, HelpCircle, Loader2, PlayCircle, Upload, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadXMLForm({
  professorId,
  onSuccess,
}: {
  professorId?: string;
  onSuccess?: () => void;
}) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  }

  async function onSubmit() {
    if (!file) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (professorId) {
        await productionService.uploadUserLattes(Number(professorId), formData);
      } else {
        await productionService.uploadLattes(formData);
      }
      toast.success("Produções cadastradas com sucesso");
      setStatus("success");

      await queryClient.invalidateQueries({
        queryKey: ["productions", professorId || "own"],
      });

      if (onSuccess) {
        onSuccess();
      } else {
        const redirectPath = professorId
          ? `/portal/productions?professorId=${professorId}`
          : "/portal/productions";
        navigate(redirectPath);
      }
    } catch (err) {
      setStatus("error");
      toast.error("Erro no cadastro das produções");
      console.error("Erro ao criar produções:", err);
    }
  }

  async function handleConfirm() {
    setShowConfirmDialog(false);
    await onSubmit();
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col w-full max-w-md gap-4 items-center">
        <div className="text-center w-full">
          <h2 className="text-lg sm:text-xl font-semibold">
            Adicionar com XML
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Envie o arquivo ZIP ou XML do Lattes
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xl">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="flex items-center gap-2 text-2xl">
                    <PlayCircle className="h-6 w-6 text-primary" />
                    Como exportar o XML do Lattes?
                  </SheetTitle>
                  <SheetDescription>
                    Siga o passo a passo no vídeo abaixo para obter seu arquivo de produções.
                  </SheetDescription>
                </SheetHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-lg">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/5n7aV5sUzMA?si=ZQvk35-fod67sV_8" title="Como exportar currículo Lattes" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-8 space-y-4">
                  <h4 className="font-semibold text-lg">Resumo simples:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Acesse a Plataforma Lattes</li>
                    <li>Va em atualizar currículo lattes</li>
                    <li>Clique em <span className="font-medium text-foreground">"Exportar"</span> no menu lateral</li>
                    <li>Selecione o formato <span className="font-medium text-foreground">"XML"</span></li>
                    <li>Clique em <span className="font-medium text-foreground">"Confirmar"</span> para baixar o arquivo</li>
                  </ol>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="w-full space-y-3">
          {!file ? (
            <Label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">
                    Clique para selecionar
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">.ZIP ou .XML</p>
              </div>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".zip,.xml"
                className="hidden"
              />
            </Label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-1 break-all">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            disabled={!file || status === "uploading"}
            onClick={() => setShowConfirmDialog(true)}
            className="w-full"
          >
            {status === "uploading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {status === "uploading" ? "Enviando..." : "Enviar arquivo"}
          </Button>

          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar Produções</AlertDialogTitle>
                <AlertDialogDescription>
                  Atenção: todas as produções registradas anteriormente serão
                  apagadas. Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Status Messages */}
          {status === "success" && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 text-center">
              Arquivo enviado com sucesso!
            </div>
          )}
          {status === "error" && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 text-center">
              Falha no envio. Tente novamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
