<?php

namespace App\Models;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\DefenseRequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use LogicException;

/**
 * Solicitação de banca. O status só muda pelas transições de DefenseRequestStatus
 * (use DefenseRequestWorkflow); o modelo recusa gravar estado inválido.
 * Arquivar = soft delete (deleted_at); apagar de vez = forceDelete.
 */
class DefenseRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'student_user_id', 'advisor_user_id', 'type', 'data', 'schema_version', 'status', 'submitted_at', 'archived_by_user_id'];

    protected $casts = [
        'data' => 'array',
        'status' => DefenseRequestStatus::class,
        'submitted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Sem versão explícita, as respostas são da versão atual do formulário.
        static::creating(fn (self $request) => $request->schema_version ??= DefenseRequestForms::VERSION);

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

    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by_user_id');
    }
}
