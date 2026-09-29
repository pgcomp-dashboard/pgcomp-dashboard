<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AwardResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'winners' => $this->whenLoaded('winners', fn () => $this->winners->map(fn ($w) => [
                'name' => $w->name,
                'recipient_type' => $w->recipient_type->value,
            ])->values()),
            'year' => $this->year,
            'scope' => $this->scope->value,
            'category_id' => $this->award_category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'description' => $this->description,
            'url' => $this->url,
            'attachment_name' => $this->attachment_name,
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
