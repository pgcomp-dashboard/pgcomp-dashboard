'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import api from '@/services/api';
import { ChangeEvent, useState } from "react";

export function ProductionDOIForm() {
  const [doi, setDoi] = useState<String>('');
  const [publisherType, setPublisherType] = useState('');

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      setDoi(e.target.value)
    }
  }

  function handleValueChange(value: string) {
    setPublisherType(value)
  }

  async function createProduction() {
    if (!doi) return;

    const request = {
      'type': publisherType,
      'doi': doi
    }
    console.log("Enviando")
    try {
      const response = await api.createProductionDoi(request)
      if (response.status == '201') {
        console.log('Criado com sucesso')
      }
    } catch (err) {
      console.error('Erro ao criar produção:', err);
    }
  }

  return (
    <div className='flex flex-col items-center align-middle'>
      <div className='flex flex-col w-1/2 gap-4 items-center align-middle'>
        <h1 className="text-3xl font-bold">Adicionar com D.O.I</h1>
        <h1 className="text-muted-foreground">Adicione suas produções a partir do D.O.I.</h1>
        {
            <RadioGroup className='flex' defaultValue='journal' onValueChange={handleValueChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value='conference' id='conference' />
                <Label>Conferencia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value='journal' id='journal' />
                <Label>Revista</Label>
              </div>
            </RadioGroup>
          }
        <div className="flex flex-col rounded-md gap-4">
          <Input placeholder='D.O.I'type="text" onChange={handleInput} />
          <Button onClick={createProduction}>Importar produções</Button>
        </div>
      </div>
    </div>
  )
}
