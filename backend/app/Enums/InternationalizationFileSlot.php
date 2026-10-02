<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

/** Os 4 arquivos do formulário: 1 PDF de comprovantes e até 3 fotos. */
enum InternationalizationFileSlot: string
{
    use EnumHelper;

    case DOCUMENT = 'document';
    case PHOTO_1 = 'photo_1';
    case PHOTO_2 = 'photo_2';
    case PHOTO_3 = 'photo_3';

    public function label(): string
    {
        return match ($this) {
            self::DOCUMENT => 'Documentos e comprovantes',
            self::PHOTO_1 => 'Foto 1',
            self::PHOTO_2 => 'Foto 2',
            self::PHOTO_3 => 'Foto 3',
        };
    }
}
