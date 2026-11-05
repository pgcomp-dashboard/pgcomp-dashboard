<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DefenseRequest extends Model
{
    use HasFactory;

    /** Aberta pelo discente, esperando o orientador revisar e confirmar. */
    public const AWAITING_ADVISOR = 'awaiting_advisor';

    /** Enviada pelo orientador à coordenação (a análise pelo colegiado fica fora da POC). */
    public const SUBMITTED = 'submitted';

    protected $fillable = ['user_id', 'student_user_id', 'advisor_user_id', 'type', 'data', 'status', 'submitted_at'];

    protected $attributes = [
        'status' => self::SUBMITTED,
    ];

    protected $casts = [
        'data' => 'array',
        'submitted_at' => 'datetime',
    ];

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
