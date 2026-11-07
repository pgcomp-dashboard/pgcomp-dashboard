<?php

namespace App\Http\Resources;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\DefenseRequestStatus;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

class DefenseRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        $person = fn ($user) => $user ? ['id' => $user->id, 'name' => $user->name] : null;
        $viewer = $request->user();
        // can_* = mesmas regras das rotas (DefenseRequestPolicy).
        $can = fn (string $ability) => $viewer !== null && Gate::forUser($viewer)->allows($ability, $this->resource);

        return [
            'id' => $this->id,
            'type' => $this->type,
            'type_label' => DefenseRequestForms::get($this->type)['label'] ?? $this->type,
            'status' => $this->status,
            // Não pode se chamar "data": o Laravel deixaria de envolver a resposta em "data".
            'answers' => $this->data,
            'schema_version' => $this->schema_version,
            'student_user_id' => $this->student_user_id,
            'advisor_user_id' => $this->advisor_user_id,
            'submitted_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            // Aguardando: quem revisa é o orientador atual do cadastro. Enviada: quem enviou.
            'advisor' => $this->whenLoaded('advisor', fn () => $this->status === DefenseRequestStatus::AWAITING_ADVISOR && $this->student
                ? $person($this->student->advisors->sortBy('id')->first())
                : $person($this->advisor)),
            'archived_at' => $this->deleted_at,
            'archived_by' => $this->whenLoaded('archivedBy', fn () => $person($this->archivedBy)),
            'can_review' => $can('review'),
            'can_archive' => $can('archive'),
            'can_restore' => $can('restore'),
            'can_delete' => $can('forceDelete'),
            'submitted_at' => $this->submitted_at,
            'created_at' => $this->created_at,
        ];
    }
}
