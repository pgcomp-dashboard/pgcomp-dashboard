<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Prêmio na listagem pública (sem login). Só inclui o que pode ser divulgado:
 * não expõe quem cadastrou, e-mail nem o anexo.
 */
class PublicAwardResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'year' => $this->year,
            'category_name' => $this->category->name,
            'scope' => $this->scope->value,
            'description' => $this->description,
            'url' => $this->url,
            'winners' => $this->winners->map(fn ($w) => [
                'name' => $w->name,
                'recipient_type' => $w->recipient_type->value,
            ])->values(),
        ];
    }
}
