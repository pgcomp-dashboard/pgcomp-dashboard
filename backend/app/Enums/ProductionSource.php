<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum ProductionSource: string
{
    use EnumHelper;

    case SCRIPT = 'script';
    case XML = 'xml';
    case MANUAL = 'manual';
    case DOI = 'doi';

    public function label(): string
    {
        return match ($this) {
            self::XML => 'xml',
            self::SCRIPT => 'script',
            self::MANUAL => 'manual',
            self::DOI => 'doi'
        };
    }
}
