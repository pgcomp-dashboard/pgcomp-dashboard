<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum CourseType: int
{
    use EnumHelper;

    case MASTER = 1;
    case DOCTORATE = 2;

    function label(): string
    {
        return match($this) {
            self::MASTER => 'Master',
            self::DOCTORATE => 'Doctorate',
        };
    }
}
