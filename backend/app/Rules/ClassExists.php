<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class ClassExists implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct() {}

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     */
    public function passes($attribute, $value): bool
    {
        if ($value !== null) {
            return class_exists((string) $value);
        }

        return true;
    }

    /**
     * Get the validation error message.
     */
    public function message(): string|array
    {
        $message = trans('validation.class_exists');

        return $message === 'validation.class_exists'
            ? ['Class :attribute does not exist']
            : $message;
    }
}
