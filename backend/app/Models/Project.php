<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'home_page',
        'start_year',
        'end_year',
        'status',
        'nature',
        'workload',
        'value',
        'funding_source',
    ];

    protected $casts = [
        'start_year' => 'integer',
        'end_year' => 'integer',
        'workload' => 'integer',
        'value' => 'decimal:2',
    ];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function scopeOfUser($query, $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        });
    }

    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'home_page' => 'nullable|string|max:255',
            'start_year' => 'required|integer|min:1900',
            'end_year' => 'nullable|integer|min:1900',
            'status' => 'nullable|string|max:255',
            'nature' => 'nullable|string|max:255',
            'workload' => 'nullable|integer',
            'value' => 'nullable|numeric',
            'funding_source' => 'nullable|string|max:255',
        ];
    }
}