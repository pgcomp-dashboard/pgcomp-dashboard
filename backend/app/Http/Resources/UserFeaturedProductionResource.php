<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserFeaturedProductionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->users_id,
            'production_id' => $this->productions_id,
            'is_featured' => (bool) $this->is_featured,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // Carrega os dados da produção caso o relacionamento esteja eager loaded
            'production' => $this->whenLoaded('production', function () {
                return [
                    'id' => $this->production->id,
                    'title' => $this->production->title,
                    'year' => $this->production->year,
                    'type' => $this->production->publisher_type,
                    'publisher' => $this->production->publisher?->name,
                ];
            }),
        ];
    }
}
