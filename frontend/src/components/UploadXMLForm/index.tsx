import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useNavigate } from "react-router";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadXMLForm() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  async function onSubmit() {
    if (!file) return;
    setStatus("uploading")
    const apiUrl = api.getBaseUrl() + '/api/portal/user/lattes-update';


    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + api.getAuthToken(),
        },
        body: formData
      });
      console.log(response)
      if (response.status === 201) {
        toast.success("Produções cadastradas com sucesso")
        setStatus("success")
        navigate('/portal/productions');
      } else {
        setStatus("error")
        toast.error("Erro no cadastro das produções")
      }
    } catch (err) {
      setStatus("error")
      toast.error("Erro no cadastro das produções")
      console.error('Erro ao criar produções:', err);
    }
  }

  return (
    <div className='flex flex-col w-full items-center align-middle px-4'>
      <div className='flex flex-col w-2/3 md:w-1/2 lg:w-1/3 gap-4 items-center align-middle'>
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Upload do XML do Lattes</h1>
        <p className="text-muted-foreground text-center">Adicione suas produções a partir do XML do lattes, coloque o arquivo zip disponibilizado ao baixar.</p>
        <div className="flex flex-col rounded-md gap-4 w-full">
          <Input type="file" onChange={handleFileChange} />

          <Button type="submit" disabled={!file || status === 'uploading'} onClick={onSubmit}>
            {status === 'uploading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'uploading' ? "Enviando..." : "Upload"}
          </Button>

          <div>
            {file &&
              <div className='text-sm text-muted-foreground mb-2'>
                <div>Arquivo: {file.name}</div>
                <div>Tamanho: {(file.size / 1024).toFixed(2)} Kb</div>
              </div>}
            {status === 'success' && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
                Arquivo enviado com sucesso! As produções estão sendo processadas.
              </div>
            )
            }
            {status === 'error' && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                Falha no envio do arquivo. Tente novamente.
              </div>
            )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
