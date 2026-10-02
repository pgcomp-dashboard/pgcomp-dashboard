<?php

namespace App\Http\Resources;

use App\Enums\InternationalizationFileSlot;
use Illuminate\Http\Resources\Json\JsonResource;

class InternationalizationActionResource extends JsonResource
{
    public function toArray($request): array
    {
        $files = $this->relationLoaded('files') ? $this->files->keyBy(fn ($f) => $f->slot->value) : collect();

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'full_name' => $this->full_name,
            'registration_number' => $this->registration_number,
            'level' => $this->level->value,
            'course' => $this->course->value,
            'lattes_status' => $this->lattes_status->value,
            'advisor_name' => $this->advisor_name,
            'country' => $this->country,
            'institution' => $this->institution,
            'foreign_research_group' => $this->foreign_research_group,
            'foreign_researcher' => $this->foreign_researcher,
            'description' => $this->description,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'call_notice' => $this->call_notice,
            'url' => $this->url,
            // Nome do arquivo de cada slot (ou null).
            'files' => collect(InternationalizationFileSlot::cases())
                ->mapWithKeys(fn ($slot) => [$slot->value => $files->get($slot->value)?->name]),
            'submitted_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
