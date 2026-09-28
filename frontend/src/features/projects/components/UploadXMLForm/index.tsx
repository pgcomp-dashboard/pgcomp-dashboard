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
import { queryClient } from "@/lib/query-client";
import { projectService } from "@/services/modules/project.service";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { ChangeEvent, DragEvent, useState } from "react";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadProjectXMLForm({
  professorId,
  onSuccess,
  portalMode = false,
}: {
  professorId?: string;
  onSuccess?: () => void;
  portalMode?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function setSelectedFile(selectedFile?: File) {
    if (!selectedFile) return;
    if (!/\.(xml|zip)$/i.test(selectedFile.name)) {
      toast.error("Selecione um arquivo .XML ou .ZIP.");
      return;
    }
    setFile(selectedFile);
    setStatus("idle");
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
  }

  async function onSubmit() {
    if (!file) return;
    if (!portalMode && !professorId) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (portalMode) {
        await projectService.importLattesFilePortal(formData);
        await queryClient.invalidateQueries({ queryKey: ["myProjects"] });
      } else {
        await projectService.importLattesFile(Number(professorId), formData);
        await queryClient.invalidateQueries({
          queryKey: ["projects", professorId],
        });
      }
      toast.success("Projetos cadastrados com sucesso");
      setStatus("success");
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus("error");
      toast.error("Erro no cadastro dos projetos");
      console.error("Erro ao importar projetos:", err);
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
            Importar projetos com XML
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Envie o arquivo ZIP ou XML do Lattes
          </p>
        </div>

        <div className="w-full space-y-3">
          {!file ? (
            <Label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setIsDragging(false);
                }
              }}
              onDrop={handleDrop}
              className={`flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/10" : "bg-muted/30 hover:bg-muted/50"}`}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">
                    {isDragging
                      ? "Solte o arquivo aqui"
                      : "Clique ou arraste o arquivo"}
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
                <AlertDialogTitle>Importar Projetos</AlertDialogTitle>
                <AlertDialogDescription>
                  Atenção: todos os projetos registrados anteriormente serão
                  apagados. Deseja continuar?
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
