<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum InternationalizationLevel: string
{
    use EnumHelper;

    case PROFESSOR = 'professor';
    case STUDENT = 'student';

    public function label(): string
    {
        return match ($this) {
            self::PROFESSOR => 'Docente',
            self::STUDENT => 'Discente',
        };
    }
}
