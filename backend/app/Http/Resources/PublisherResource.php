<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublisherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'initials' => $this->initials,
            'name' => $this->name,
            'publisher_type' => $this->publisher_type,
            'issn' => $this->issn,
            'scopus_url' => $this->scopus_url,
            'sbc_adjustment' => $this->sbc_adjustment,
            'percentile' => $this->percentile,
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
