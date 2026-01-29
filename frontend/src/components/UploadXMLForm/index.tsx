import { apiClient } from '@/services/http-client';
import { Loader2, UploadCloud } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadXMLForm() {
  const navigate = useNavigate();
  const [ file, setFile ] = useState<File | null>(null);
  const [ status, setStatus ] = useState<UploadStatus>('idle');

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function onSubmit() {
    if (!file) return;
    setStatus('uploading');
    const apiUrl = apiClient.getBaseUrl() + '/api/portal/user/lattes-update';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiClient.getAuthToken(),
        },
        body: formData,
      });
      console.log(response);
      if (response.status === 201) {
        toast.success('Produções cadastradas com sucesso');
        setStatus('success');
        navigate('/portal/productions');
        window.location.reload();
      } else {
        setStatus('error');
        toast.error('Erro no cadastro das produções');
      }
    } catch (err) {
      setStatus('error');
      toast.error('Erro no cadastro das produções');
      console.error('Erro ao criar produções:', err);
    }
  }

  return (
    <div className="flex flex-col w-full items-center align-middle px-4 py-8 rounded-lg ">
      <div className="flex flex-col w-2/3 md:w-1/2 lg:w-1/3 gap-6 items-center align-middle">
        <UploadCloud className="h-16 w-16" />
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
          Upload do XML do Lattes
        </h1>
        <p className="text-muted-foreground text-center text-gray-600">
          Adicione suas produções realizando o upload do arquivo .zip do
          Currículo Lattes, obtido ao baixar o XML na plataforma Lattes.
          <br />
          <a
            href="https://lattes.cnpq.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Acesse a plataforma Lattes
          </a>
        </p>
        <div className="flex flex-col rounded-md gap-4 w-100 bg-white p-6 ">
          <Input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 rounded-md"
          />

          <Button
            type="submit"
            disabled={!file || status === 'uploading'}
            onClick={onSubmit}
            className=" text-white"
          >
            {status === 'uploading' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {status === 'uploading' ? 'Enviando...' : 'Upload'}
          </Button>

          {status === 'uploading' && <Progress value={50} className="mt-4" />}

          <div>
            {file && (
              <div className="text-sm text-gray-700 mb-2">
                <div className="font-medium">Arquivo selecionado:</div>
                <div>Nome: {file.name}</div>
                <div>Tamanho: {(file.size / 1024).toFixed(2)} Kb</div>
              </div>
            )}
            {status === 'success' && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
                Arquivo enviado com sucesso! As produções estão sendo
                processadas.
              </div>
            )}
            {status === 'error' && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                Falha no envio do arquivo. Tente novamente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
