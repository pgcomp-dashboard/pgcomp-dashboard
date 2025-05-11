<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum PublisherType: string
{
    use EnumHelper;

    case JOURNAL = 'journal';
    case CONFERENCE = 'conference';


    public function label(): string
    {
        return match ($this) {
            self::JOURNAL => 'journal',
            self::CONFERENCE => 'conference',
        };
    }
}
