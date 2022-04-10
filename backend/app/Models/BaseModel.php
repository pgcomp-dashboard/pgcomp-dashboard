<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class BaseModel extends Model
{
    abstract public static function creationRules(): array;

    abstract public static function updateRules(): array;

    public static function create(array $attributes = []): static
    {
        $validator = Validator::make($attributes, static::creationRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return static::query()->create($validator->validated());
    }

    public function update(array $attributes = [], array $options = []): static
    {
        $validator = Validator::make($attributes, static::updateRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        parent::update($validator->validated(), $options);

        return $this;
    }

    public static function updateOrCreateModel(array $attributes, array $values = [], array $updateOptions = [])
    {
        /** @var BaseModel $model */
        $model = static::where($attributes)->first();
        if (empty($model)) {
            return static::create(array_merge($attributes, $values));
        }

        return $model->update(array_merge($attributes, $values), $updateOptions);
    }
}
