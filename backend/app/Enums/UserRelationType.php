<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum UserRelationType: string
{
    use EnumHelper;

    case ADVISOR = 'advisor';
    case CO_ADVISOR = 'co-advisor';

    function label(): string
    {
        return match($this) {
            self::ADVISOR => 'Orientador',
            self::CO_ADVISOR => 'Coorientador',
        };
    }
}
