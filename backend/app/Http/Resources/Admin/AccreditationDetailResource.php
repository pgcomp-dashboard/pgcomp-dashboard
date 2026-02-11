<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\AccreditationProductionResource;
use Illuminate\Http\Resources\Json\JsonResource;

class AccreditationDetailResource extends JsonResource
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
            'lattes_url' => $this->lattes_url,
            'total_score' => (float) $this->total_score,
            'productions' => AccreditationProductionResource::collection($this->productions),
        ];
    }
}
