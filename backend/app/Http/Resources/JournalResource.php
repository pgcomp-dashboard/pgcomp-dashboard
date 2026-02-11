<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class JournalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'issn' => $this->issn,
            'sbc_adjustment' => $this->sbc_adjustment,
            'scopus_url' => $this->scopus_url,
            'percentile' => $this->percentile,
            'last_qualis' => $this->last_qualis,
            'update_date' => $this->update_date,
            'tentative_date' => $this->tentative_date,
            'logs' => $this->logs,
            'stratum_qualis_id' => $this->stratum_qualis_id,
            'stratum_qualis' => new StratumQualisResource($this->whenLoaded('stratumQualis')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
