'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { ChangeEvent, useState } from "react";

export function ProductionDOIForm() {
  const [doi, setDoi] = useState<String>('');

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      setDoi(e.target.value)
    }
  }

  async function createProduction() {
    if (!doi) return;

    const request = {
      'doi': doi
    }
    console.log("Enviando")
    try {
      const response = api.createProductionDoi(request)
      console.log(response)
    } catch (err) {
      console.error('Erro ao criar publicações:', err);
    }
  }

  return (
    <div className='flex flex-col items-center align-middle'>
      <div className='w-1/2'>
        <h1 className="text-muted-foreground">Adicione suas publicações a partir do D.O.I.</h1>
        <div className="rounded-md">
          <Label>D.O.I</Label>
          <Input type="text" onChange={handleInput} />
          <Button onClick={createProduction}>Importar publicação</Button>
        </div>
      </div>
    </div>
  )
}
