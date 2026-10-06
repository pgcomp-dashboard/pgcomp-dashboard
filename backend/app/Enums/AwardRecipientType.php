<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum AwardRecipientType: string
{
    use EnumHelper;

    case PROFESSOR = 'professor';
    case STUDENT = 'student';
    case STAFF = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::PROFESSOR => 'Docente',
            self::STUDENT => 'Discente',
            self::STAFF => 'Técnico Administrativo',
        };
    }
}
