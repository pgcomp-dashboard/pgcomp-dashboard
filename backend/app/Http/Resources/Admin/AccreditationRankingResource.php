<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class AccreditationRankingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'category' => $this->category,
            'pq' => (bool) $this->pq,
            'is_senior' => (bool) $this->is_senior,
            'lattes_url' => $this->lattes_url,
            'total_score' => (float) $this->total_score,
            'a1_a4_count' => (int) $this->a1_a4_count,
            'is_accredited' => (bool) $this->is_accredited,
            'reasons' => $this->reasons,
            'qualis_breakdown' => $this->qualis_breakdown,
        ];
    }
}
