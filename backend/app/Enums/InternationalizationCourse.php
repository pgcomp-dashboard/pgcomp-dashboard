<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum InternationalizationCourse: string
{
    use EnumHelper;

    case MASTERS = 'masters';
    case DOCTORATE = 'doctorate';
    case PROFESSOR = 'professor';

    public function label(): string
    {
        return match ($this) {
            self::MASTERS => 'Mestrado',
            self::DOCTORATE => 'Doutorado',
            self::PROFESSOR => 'Docente',
        };
    }
}
