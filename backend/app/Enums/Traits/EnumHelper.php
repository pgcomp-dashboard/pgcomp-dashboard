<?php

namespace App\Enums\Traits;

trait EnumHelper
{
    /** Get an array of case values. */
    public static function values(): array
    {
        return array_column(static::cases(), 'value');
    }

    /** Get an array of case names. */
    public static function names(): array
    {
        return array_column(static::cases(), 'name');
    }

    /** Get an associative array of [case name => case value]. */
    public static function options(): array
    {
        return array_column(static::cases(), 'value', 'name');
    }

    abstract function label(): string;
}
