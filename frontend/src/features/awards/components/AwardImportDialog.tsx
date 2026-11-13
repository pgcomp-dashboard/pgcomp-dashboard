import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AwardCategory, ImportAwardInput } from '@/features/awards/types';
import { parseApiError } from '@/services/http-client';
import { ClipboardCopy, FileJson2, Upload, X } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const currentYear = new Date().getFullYear();

const importSchema = z
  .array(
    z.object({
      year: z.number({
        required_error: 'campo obrigatório',
        invalid_type_error: 'informe um ano como número',
      }).int('informe um ano inteiro').min(1900, 'o ano deve ser igual ou posterior a 1900').max(currentYear, `o ano não pode ser posterior a ${currentYear}`),
      scope: z.enum([ 'national', 'international' ], {
        errorMap: () => ({ message: 'use "national" ou "international"' }),
      }),
      award_category_name: z.string({ required_error: 'informe o nome da categoria' }).min(1, 'informe o nome da categoria'),
      description: z.string({ required_error: 'informe a descrição' }).min(10, 'a descrição deve ter pelo menos 10 caracteres').max(5000, 'a descrição deve ter no máximo 5.000 caracteres'),
      url: z.string({ required_error: 'informe uma URL válida ou null' }).url('informe uma URL válida ou null').max(2048, 'a URL deve ter no máximo 2.048 caracteres').nullable(),
      winners: z
        .array(
          z.object({
            name: z.string({ required_error: 'informe o nome completo' }).min(2, 'informe o nome completo (mínimo 2 caracteres)').max(255, 'o nome deve ter no máximo 255 caracteres'),
            recipient_type: z.enum([ 'professor', 'student', 'staff' ], {
              errorMap: () => ({ message: 'use "professor", "student" ou "staff"' }),
            }),
          }),
          { required_error: 'adicione pelo menos um vencedor' },
        )
        .min(1, 'adicione pelo menos um vencedor')
        .max(20, 'cada prêmio pode ter no máximo 20 vencedores'),
    }),
  )
  .min(1, 'o arquivo precisa conter pelo menos um prêmio')
  .max(500, 'o limite é de 500 prêmios por importação');

const exampleJson = `[
  {
    "year": 2014,
    "scope": "international",
    "award_category_name": "Best paper",
    "description": "Melhor artigo no ECRTS 2014",
    "url": null,
    "winners": [
      {
        "name": "George Marconi de Araújo Lima",
        "recipient_type": "professor"
      }
    ]
  }
]`;

const fieldLabels: Record<string, string> = {
  year: 'ano',
  scope: 'abrangência',
  award_category_name: 'categoria',
  description: 'descrição',
  url: 'link',
  winners: 'vencedores',
  name: 'nome do vencedor',
  recipient_type: 'tipo de vencedor',
};

function formatValidationIssues(
  issues: z.ZodIssue[],
): string {
  const messages = issues.map((issue) => {
    const [ awardIndex, field, winnerIndex, nestedField ] = issue.path;
    if (typeof awardIndex !== 'number') return issue.message;

    const awardLabel = `Prêmio ${awardIndex + 1}`;
    if (typeof field !== 'string') return `${awardLabel}: ${issue.message}`;

    const location =
      field === 'winners' && typeof winnerIndex === 'number'
        ? `${awardLabel}, vencedor ${winnerIndex + 1} (${fieldLabels[String(nestedField)] ?? 'vencedores'})`
        : `${awardLabel} (${fieldLabels[field] ?? field})`;
    return `${location}: ${issue.message}`;
  });
  const visibleMessages = messages.slice(0, 10);
  if (messages.length > visibleMessages.length) {
    visibleMessages.push(`... e mais ${messages.length - visibleMessages.length} erro(s).`);
  }
  return visibleMessages.join('\n');
}

function formatImportError(error: unknown): string {
  const message = parseApiError(error);
  const apiError = error as { code?: unknown } | null;
  if (apiError && apiError.code === 422) {
    return `A API recusou alguns dados. Confira os campos abaixo e tente novamente:\n${message}`;
  }
  return message;
}

interface AwardImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isImporting: boolean;
  categories: AwardCategory[];
  onImport: (awards: ImportAwardInput[]) => Promise<unknown>;
}

export function AwardImportDialog({
  open,
  onOpenChange,
  isImporting,
  categories,
  onImport,
}: AwardImportDialogProps) {
  const [ json, setJson ] = useState(exampleJson);
  const [ error, setError ] = useState<string | null>(null);
  const [ fileName, setFileName ] = useState<string | null>(null);
  const [ activeTab, setActiveTab ] = useState('import');
  const [ showCategories, setShowCategories ] = useState(false);
  const [ promptCopyStatus, setPromptCopyStatus ] = useState<'idle' | 'copied' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryNames = categories.map((category) => category.name);
  const suggestedPrompt = `Transforme os dados que vou fornecer em um array JSON válido para importar prêmios.

Regras:
- Não invente nem deduza dados ausentes. Se faltar uma informação obrigatória ou houver dúvida sobre vencedor, categoria, ano ou abrangência, pergunte antes de montar o JSON.
- Use somente categorias da lista e copie o nome exatamente como está escrito.
- Cada objeto deve conter year (número inteiro), scope ("national" ou "international"), award_category_name, description (10 a 5000 caracteres), url (URL válida ou null) e winners (array com 1 a 20 itens).
- Cada vencedor deve conter name (nome completo) e recipient_type ("professor", "student" ou "staff").
- Retorne somente o array JSON, sem markdown nem explicações.

Categorias disponíveis:
${categoryNames.length > 0 ? categoryNames.map((name) => `- ${name}`).join('\n') : '(categorias indisponíveis; solicite a lista antes de continuar)'}

Dados de origem:
[COLE AQUI AS INFORMAÇÕES DOS PRÊMIOS]`;

  useEffect(() => {
    if (!open) {
      setError(null);
      setFileName(null);
      setJson(exampleJson);
      setActiveTab('import');
      setShowCategories(false);
      setPromptCopyStatus('idle');
    }
  }, [ open ]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setFileName(null);
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Selecione um arquivo com extensão .json.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('O arquivo excede o limite de 5 MB.');
      return;
    }

    try {
      const contents = (await file.text()).replace(/^\uFEFF/, '');
      setJson(contents);
      setFileName(file.name);
    } catch (readError) {
      console.error('Erro ao ler arquivo JSON de prêmios:', readError);
      setError('Não foi possível ler o arquivo selecionado. Tente novamente.');
    }
  };

  const handleImport = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError('O JSON está malformado. Confira aspas, vírgulas, colchetes e chaves.');
      setActiveTab('import');
      return;
    }

    const result = importSchema.safeParse(parsed);
    if (!result.success) {
      setError(formatValidationIssues(result.error.issues));
      setActiveTab('import');
      return;
    }

    setError(null);
    try {
      await onImport(result.data);
      onOpenChange(false);
    } catch (importError) {
      setError(formatImportError(importError));
      setActiveTab('import');
    }
  };

  const copySuggestedPrompt = async () => {
    try {
      await navigator.clipboard.writeText(suggestedPrompt);
      setPromptCopyStatus('copied');
    } catch (copyError) {
      console.error('Erro ao copiar prompt de importação:', copyError);
      setPromptCopyStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar prêmios</DialogTitle>
          <DialogDescription>
            Consulte o formato esperado ou selecione um arquivo JSON para importar.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Importar JSON</TabsTrigger>
            <TabsTrigger value="instructions">Instruções</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="award-import-file">
                Arquivo JSON (máximo 5 MB)
              </label>
              <Input
                ref={fileInputRef}
                id="award-import-file"
                type="file"
                accept=".json,application/json"
                className="hidden"
                disabled={isImporting}
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Selecionar arquivo
                </Button>
                {fileName && (
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <FileJson2 className="h-4 w-4 shrink-0" />
                    <span className="max-w-64 truncate">{fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover arquivo selecionado"
                      disabled={isImporting}
                      onClick={() => {
                        setFileName(null);
                        setError(null);
                        setJson(exampleJson);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                O conteúdo do arquivo aparecerá abaixo para você revisar antes de importar.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="award-import-json">
                Conteúdo JSON
              </label>
              <Textarea
                id="award-import-json"
                value={json}
                onChange={(event) => {
                  setJson(event.target.value);
                  setError(null);
                  setFileName(null);
                }}
                aria-label="JSON dos prêmios para importar"
                aria-invalid={!!error}
                className="min-h-72 font-mono text-xs"
                disabled={isImporting}
                spellCheck={false}
              />
            </div>
            {error && (
              <div
                className="whitespace-pre-wrap rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="mt-4 space-y-4">
            <div className="space-y-2 rounded-md bg-muted p-4 text-sm">
              <h3 className="font-semibold">Formato e limites</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>O arquivo deve ser um array JSON com 1 a 500 prêmios.</li>
                <li>O ano deve ser um número inteiro entre 1900 e {currentYear}.</li>
                <li>
                  <code>scope</code> aceita <code>national</code> ou{' '}
                  <code>international</code>.
                </li>
                <li>
                  <code>award_category_name</code> deve corresponder exatamente
                  a uma categoria já cadastrada.
                </li>
                <li>
                  A descrição deve ter de 10 a 5.000 caracteres; o link deve ser
                  uma URL válida ou <code>null</code>.
                </li>
                <li>
                  Cada prêmio precisa ter de 1 a 20 vencedores. O nome da pessoa
                  deve ter de 2 a 255 caracteres.
                </li>
                <li>
                  <code>recipient_type</code> aceita <code>professor</code>,{' '}
                  <code>student</code> ou <code>staff</code>.
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Exemplo de estrutura</h3>
              <pre className="max-h-72 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                <code>{exampleJson}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Após a importação, vencedores cujo nome e tipo não correspondam a
              uma única conta serão cadastrados sem vínculo e identificados no
              resultado. A importação não cria categorias.
            </p>
            <div className="space-y-2 rounded-md border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Categorias de prêmio</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCategories((visible) => !visible)}
                >
                  {showCategories ? 'Ocultar categorias' : 'Ver categorias'}
                </Button>
              </div>
              {showCategories && (
                categoryNames.length > 0 ? (
                  <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {categoryNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria disponível no momento. Tente novamente mais tarde.
                  </p>
                )
              )}
            </div>
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Prompt sugerido para montar o JSON</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copySuggestedPrompt}
                >
                  <ClipboardCopy className="h-4 w-4" />
                  {promptCopyStatus === 'copied' ? 'Copiado' : 'Copiar prompt'}
                </Button>
              </div>
              <Textarea
                value={suggestedPrompt}
                readOnly
                aria-label="Prompt sugerido para montar o JSON de prêmios"
                className="min-h-48 font-mono text-xs"
              />
              {promptCopyStatus === 'copied' && (
                <p className="text-sm text-green-700" role="status">
                  Prompt copiado. Cole-o na ferramenta de IA junto com os dados de origem.
                </p>
              )}
              {promptCopyStatus === 'error' && (
                <p className="text-sm text-destructive" role="alert">
                  Não foi possível copiar automaticamente. Selecione e copie o texto do prompt.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isImporting}
            onClick={handleImport}
          >
            {isImporting ? 'Importando...' : 'Importar prêmios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
