<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
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
            'id' => $this->id,
            'registration' => $this->registration,
            'siape' => $this->siape,
            'name' => $this->name,
            'type' => $this->type,
            'category' => $this->category,
            'email' => $this->email,
            'is_admin' => $this->is_admin,
            'lattes_url' => $this->lattes_url,
            'defended_at' => $this->defended_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Relationships can be added here using $this->whenLoaded()
            'course' => $this->whenLoaded('course'),
            'area' => $this->whenLoaded('area'),
        ];
    }
}
