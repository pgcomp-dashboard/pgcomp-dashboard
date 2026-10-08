<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentRankingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'registration' => $this->registration,
            'course_name' => $this->course_name,
            'area_name' => $this->area_name,
            'productions_count' => (int) $this->productions_count,
            'a1_a4_count' => (int) $this->a1_a4_count,
            'a1_a2_count' => (int) $this->a1_a2_count,
            'ja1' => (int) $this->ja1,
            'ja2' => (int) $this->ja2,
            'ja3' => (int) $this->ja3,
            'ja4' => (int) $this->ja4,
            'ca1' => (int) $this->ca1,
            'ca2' => (int) $this->ca2,
            'ca3' => (int) $this->ca3,
            'ca4' => (int) $this->ca4,
            'total_score' => (float) $this->total_score,
            'position' => (int) $this->position,
            'is_eligible' => (bool) $this->is_eligible,
            'reasons' => $this->reasons,
        ];
    }
}
