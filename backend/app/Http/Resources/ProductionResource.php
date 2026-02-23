<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Production
 */
class ProductionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'year' => $this->year,
            'publisher_type' => $this->publisher_type,
            'publisher_id' => $this->publisher_id,
            'last_qualis' => $this->last_qualis,
            'doi' => $this->doi,
            'source' => $this->source,
            'home_page' =>$this->home_page,
            'nature' => $this->nature,
            'publisher' => $this->whenLoaded('publisher'),
        ];
    }
}
