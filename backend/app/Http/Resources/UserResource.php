<?php

namespace App\Http\Resources;

use App\Enums\UserType;
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
            'name' => $this->name,
            'type' => $this->type,
            'category' => $this->category,
            'email' => $this->email,
            'is_admin' => $this->is_admin,
            'lattes_url' => $this->lattes_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Student specific fields
            $this->mergeWhen($this->type === UserType::STUDENT, [
                'registration' => $this->registration,
                'defended_at' => $this->defended_at,
                'course' => $this->whenLoaded('course'),
                'area' => $this->whenLoaded('area'),
            ]),

            // Professor/Manager specific fields
            $this->mergeWhen($this->type !== UserType::STUDENT, [
                'siape' => $this->siape,
                'is_admin' => $this->is_admin,
            ]),
        ];
    }
}
