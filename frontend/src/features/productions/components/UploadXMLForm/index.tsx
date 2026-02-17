import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/query-client";
import { productionService } from "@/services/modules/production.service";
import { FileText, Loader2, Upload, X } from "lucide-react";
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

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col w-full max-w-md gap-4 items-center">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Adicionar com XML
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Envie o arquivo ZIP ou XML do Lattes
          </p>
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
            onClick={onSubmit}
            className="w-full"
          >
            {status === "uploading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {status === "uploading" ? "Enviando..." : "Enviar arquivo"}
          </Button>

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
