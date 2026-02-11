<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConferenceResource extends JsonResource
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
            'category' => $this->category,
            'link' => $this->link,
            'ce_indicated' => $this->ce_indicated,
            'h5' => $this->h5,
            'last_qualis' => $this->last_qualis,
            'logs' => $this->logs,
            'h5_old' => $this->h5_old,
            'use_scholar' => $this->use_scholar,
            'qualis_2016' => $this->qualis_2016,
            'qualis_2016_id' => $this->qualis_2016_id,
            'qualis_without_induction' => $this->qualis_without_induction,
            'qualis_without_induction_id' => $this->qualis_without_induction_id,
            'sbc_adjustment_or_event' => $this->sbc_adjustment_or_event,
            'stratum_qualis_id' => $this->stratum_qualis_id,
            'stratum_qualis' => new StratumQualisResource($this->whenLoaded('stratumQualis')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
