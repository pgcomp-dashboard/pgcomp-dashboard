<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum AwardScope: string
{
    use EnumHelper;

    case NATIONAL = 'national';
    case INTERNATIONAL = 'international';

    public function label(): string
    {
        return match ($this) {
            self::NATIONAL => 'Nacional',
            self::INTERNATIONAL => 'Internacional',
        };
    }
}
