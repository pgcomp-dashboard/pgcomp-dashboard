<?php

namespace App\Models;

use App\Enums\DefenseRequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * Solicitação de banca. O status só muda pelas transições de DefenseRequestStatus
 * (use DefenseRequestWorkflow); o modelo recusa gravar estado inválido.
 */
class DefenseRequest extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'student_user_id', 'advisor_user_id', 'type', 'data', 'status', 'submitted_at'];

    protected $casts = [
        'data' => 'array',
        'status' => DefenseRequestStatus::class,
        'submitted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $request) {
            if (! $request->status instanceof DefenseRequestStatus) {
                throw new LogicException('Solicitação de banca sem status: use DefenseRequestWorkflow.');
            }

            // "Enviada" e "data de envio" andam juntas.
            if ($request->status->isSubmitted() !== ($request->submitted_at !== null)) {
                throw new LogicException("Status {$request->status->value} incompatível com submitted_at.");
            }

            if ($request->exists && $request->isDirty('status')) {
                $from = DefenseRequestStatus::from($request->getRawOriginal('status'));
                if (! $from->canTransitionTo($request->status)) {
                    throw new LogicException("Transição proibida: {$from->value} → {$request->status->value}.");
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function advisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'advisor_user_id');
    }
}
