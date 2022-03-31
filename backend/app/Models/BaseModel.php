<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class BaseModel extends Model
{
    abstract public static function creationRules(): array;

    abstract public static function updateRules(): array;

    public static function createModel(array $attributes = []): static
    {
        $validator = Validator::make($attributes, static::creationRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return parent::create($validator->validated());
    }

    public static function updateModel(int $id, array $attributes = [], array $options = []): static
    {
        $validator = Validator::make($attributes, static::updateRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $model = static::findOrFail($id);

        $model->update($validator->validated(), $options);

        return $model;
    }

    public static function updateOrCreateModel(array $attributes, array $values = [])
    {
        $model = static::where($attributes)->first();
        if (empty($model)) {
            return static::createModel(array_merge($attributes, $values));
        }

        return static::updateModel($model->id, array_merge($attributes, $values));
    }
}
