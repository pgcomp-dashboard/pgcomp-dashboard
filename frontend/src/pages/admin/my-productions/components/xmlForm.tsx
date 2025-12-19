'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api  from "@/services/api";
import { ChangeEvent, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ProductionXMLForm() {
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

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:80/api/portal/user/lattes-update', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData
      });

      console.log(response)
      setStatus("success")
    } catch (err) {
      console.error('Erro ao criar produções:', err);
    }
  }

  return (
    <div className='flex flex-col items-center align-middle'>
      <div className='flex flex-col w-1/3 gap-4 items-center align-middle'>
        <h1 className="text-3xl font-bold">Adicionar com XML</h1>
        <p className="text-muted-foreground text-center">Adicione suas produções a partir do XML do lattes, coloque o arquivo zip disponibilizado ao baixar.</p>
        <div className="flex flex-col rounded-md gap-4">
          <Input type="file" onChange={handleFileChange} />
          {file && status !== "uploading" &&
            <Button type="submit" disabled={!file} onClick={onSubmit}>Enviar</Button>
          }
          <div>
            {/*file &&
              <div>
                <div>{file.name}</div>
                <div>{(file.size / 1024).toFixed(2)} Kb</div>
                <div>{file.type}</div>
              </div>
            */}
            {status === 'success' && (
              <p>
                File Uploaded sucessfuly
              </p>
            )
            }
            {status === 'error' && (
              <p>
                Uploaded failed
              </p>
            )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
