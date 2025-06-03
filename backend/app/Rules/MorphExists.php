<?php

namespace App\Rules;

use DB;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Database\Eloquent\Model;

class MorphExists implements DataAwareRule, Rule
{
    protected array $data = [];

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct(protected ?string $typeColumn = null, protected string $valueColumn = 'id') {}

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     */
    public function passes($attribute, $value): bool
    {
        if (empty($this->typeColumn)) {
            $exploded = explode('_', $attribute);
            array_pop($exploded);
            $this->typeColumn = implode('_', $exploded).'_type';
        }
        $type = $this->data[$this->typeColumn];
        if (empty($type)) {
            return false;
        }
        if (class_exists($type)) {
            /* @var Model $type */
            return $type::query()->where($this->valueColumn, $value)->exists();
        }

        return DB::table($type)->where($this->valueColumn, $value)->exists();
    }

    /**
     * Get the validation error message.
     */
    public function message(): string|array
    {
        $message = trans('validation.morph_exists');

        return $message === 'validation.morph_exists'
            ? ['Relationship :attribute does not exist']
            : $message;
    }

    public function setData($data): MorphExists|static
    {
        $this->data = $data;

        return $this;
    }
}
