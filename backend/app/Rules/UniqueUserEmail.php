<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class UniqueUserEmail implements ValidationRule
{
    public function __construct(private readonly ?int $ignoreUserId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            return;
        }

        $email = strtolower(trim($value));
        $primaryExists = DB::table('users')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->when(
                $this->ignoreUserId !== null,
                fn ($query) => $query->where('id', '!=', $this->ignoreUserId),
            )
            ->exists();
        $secondaryExists = DB::table('user_email')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->when(
                $this->ignoreUserId !== null,
                fn ($query) => $query->where('user_id', '!=', $this->ignoreUserId),
            )
            ->exists();

        if ($primaryExists || $secondaryExists) {
            $fail('Este e-mail já está cadastrado para outro usuário.');
        }
    }
}
