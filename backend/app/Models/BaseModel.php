<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class BaseModel extends Model
{
    abstract public static function creationRules(): array;

    abstract public static function updateRules(): array;

    public function create(array $attributes = []): static
    {
        $validator = Validator::make($attributes, $this::creationRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return parent::create($validator->validated());
    }

    public function update(array $attributes = [], array $options = [])
    {
        $rules = $this::updateRules();
        if (empty($rules[$this->primaryKey])) {
            $rules[$this->primaryKey] = 'required';
        }

        $validator = Validator::make($attributes, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $model = static::findOrFail($attributes[$this->primaryKey]);

        return $model->update($validator->validated(), $options);
    }
}
