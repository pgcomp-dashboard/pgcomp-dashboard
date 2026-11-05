<?php

namespace App\Http\Resources;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Models\DefenseRequest;
use Illuminate\Http\Resources\Json\JsonResource;

class DefenseRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        $person = fn ($user) => $user ? ['id' => $user->id, 'name' => $user->name] : null;

        return [
            'id' => $this->id,
            'type' => $this->type,
            'type_label' => DefenseRequestForms::get($this->type)['label'] ?? $this->type,
            'status' => $this->status,
            // Não pode se chamar "data": o Laravel deixaria de envolver a resposta em "data".
            'answers' => $this->data,
            'student_user_id' => $this->student_user_id,
            'advisor_user_id' => $this->advisor_user_id,
            'submitted_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'advisor' => $this->whenLoaded('advisor', fn () => $person($this->advisor)),
            // O orientador revisa e envia o que o discente abriu.
            'can_review' => $this->status === DefenseRequest::AWAITING_ADVISOR
                && $request->user()?->id === $this->advisor_user_id,
            'submitted_at' => $this->submitted_at,
            'created_at' => $this->created_at,
        ];
    }
}
