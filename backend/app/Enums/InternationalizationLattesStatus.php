<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum InternationalizationLattesStatus: string
{
    use EnumHelper;

    case REGISTERED = 'registered';
    case PENDING = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::REGISTERED => 'Sim',
            self::PENDING => 'Não, mas irei',
        };
    }
}
