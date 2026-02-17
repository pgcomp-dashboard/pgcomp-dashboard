import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB

const fileFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Tamanho máximo é 5MB.")
    .refine(
      (file) =>
        file?.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Apenas arquivos .xlsx são suportados.",
    ),
});

interface PublisherImportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    formData: FormData,
    type: "journal" | "conference",
  ) => Promise<void>;
}

export function PublisherImport({
  isOpen,
  onOpenChange,
  onImport,
}: PublisherImportProps) {
  const [spreadSheetType, setSpreadSheetType] = useState<
    "journal" | "conference"
  >("journal");
  const [importStatus, setImportStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
  });

  async function onSubmit(values: z.infer<typeof fileFormSchema>) {
    try {
      setImportStatus("uploading");
      const formData = new FormData();
      formData.append("file", values.file);

      await onImport(formData, spreadSheetType);
      setImportStatus("success");

      setTimeout(() => {
        onOpenChange(false);
        setImportStatus("idle");
        form.reset();
      }, 1500);
    } catch (err) {
      setImportStatus("error");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Importar Planilha Qualis</DialogTitle>
          <DialogDescription>
            Selecione o tipo de veículo e envie o arquivo .xlsx para atualizar a
            base de dados.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Tipo de Veículo</Label>
              <RadioGroup
                className="flex gap-6"
                defaultValue="journal"
                value={spreadSheetType}
                onValueChange={(value) => {
                  setSpreadSheetType(value as "journal" | "conference");
                }}
              >
                <div className="flex gap-2 items-center">
                  <RadioGroupItem value="journal" id="journal-modal" />
                  <Label
                    htmlFor="journal-modal"
                    className="text-sm cursor-pointer"
                  >
                    Periódico
                  </Label>
                </div>
                <div className="flex gap-2 items-center">
                  <RadioGroupItem value="conference" id="conference-modal" />
                  <Label
                    htmlFor="conference-modal"
                    className="text-sm cursor-pointer"
                  >
                    Conferência
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    Arquivo (.xlsx)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {!form.watch("file") ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/20">
                          <div className="flex flex-col items-center justify-center py-4">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-primary">
                                Clique para selecionar
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Planilha .xlsx
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={(e) => {
                              if (!e.target.files) return;
                              field.onChange(e.target.files[0]);
                              setImportStatus("idle");
                            }}
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-muted-foreground/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium line-clamp-1 break-all">
                                {form.watch("file").name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(form.watch("file").size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8 shrink-0 hover:text-destructive"
                            onClick={() => {
                              form.setValue(
                                "file",
                                undefined as unknown as File,
                              );
                              setImportStatus("idle");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {importStatus === "success" && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 text-center animate-in fade-in zoom-in duration-200">
                Arquivo enviado com sucesso!
              </div>
            )}

            {importStatus === "error" && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 text-center animate-in fade-in zoom-in duration-200">
                Falha no envio. Tente novamente.
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !form.watch("file") ||
                  importStatus === "uploading" ||
                  importStatus === "success"
                }
              >
                {importStatus === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar arquivo"
                )}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="w-full text-muted-foreground"
                onClick={() => {
                  onOpenChange(false);
                  setImportStatus("idle");
                  form.reset();
                }}
                disabled={importStatus === "uploading"}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
