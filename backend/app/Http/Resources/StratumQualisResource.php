<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StratumQualisResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'code' => $this->code,
            'score' => (float) $this->score,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
