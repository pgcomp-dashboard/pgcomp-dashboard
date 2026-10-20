<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ação de internacionalização na listagem pública (sem login). Não expõe
 * matrícula/SIAPE, orientador, situação no Lattes, quem cadastrou nem arquivos.
 */
class PublicInternationalizationActionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category_name' => $this->category->name,
            'full_name' => $this->full_name,
            'level' => $this->level->value,
            'course' => $this->course->value,
            'country' => $this->country,
            'institution' => $this->institution,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'description' => $this->description,
            'url' => $this->url,
        ];
    }
}
