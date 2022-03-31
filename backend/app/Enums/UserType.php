<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum UserType: string
{
    use EnumHelper;

    case STUDENT = 'student';
    case PROFESSOR = 'professor';

    public function label(): string
    {
        return match ($this) {
            self::PROFESSOR => 'doscente',
            self::STUDENT => 'discente',
        };
    }
}
