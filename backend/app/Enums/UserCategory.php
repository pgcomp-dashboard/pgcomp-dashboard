<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

enum UserCategory: string
{
    use EnumHelper;

    case PERMANENTE = 'permanente';
    case COLABORADOR = 'colaborador';
    case VISITANTE = 'visitante';

    public function label(): string
    {
        return match ($this) {
            self::PERMANENTE => 'permanente',
            self::COLABORADOR => 'colaborador',
            self::VISITANTE => 'visitante',
        };
    }
}
