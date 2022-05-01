<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class BaseModel extends Model
{
    /**
     * The attributes that are used to sort.
     *
     * @var string[]
     */
    protected array $sortable = ['*'];

    /**
     * The attributes that are used to filter.
     *
     * @var string[]
     */
    protected array $filterable = ['*'];

    /**
     * @return array creation rules to validate attributes.
     */
    abstract public static function creationRules(): array;

    /**
     * @param array $attributes model attributes do save.
     * @return static new model instance saved.
     * @throws ValidationException check if attributes are valid.
     */
    public static function create(array $attributes = []): static
    {
        $validator = Validator::make($attributes, static::creationRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return static::query()->create($validator->validated());
    }

    /**
     * @param array $attributes attributes to find model
     * @param array $values attributes to save or update model.
     * @param array $updateOptions options to update method.
     * @return static updated or created model instance.
     * @throws ValidationException check if attributes are valid.
     */
    public static function updateOrCreate(array $attributes, array $values = [], array $updateOptions = []): static
    {
        /** @var BaseModel $model */
        $model = static::where($attributes)->first();
        if (empty($model)) {
            return static::create(array_merge($attributes, $values));
        }

        $model->update(array_merge($attributes, $values), $updateOptions);

        return $model;
    }

    /**
     * @return array update rules to validate attributes.
     */
    abstract public function updateRules(): array;

    /**
     * @param array $attributes attributes to update current model
     * @param array $options options to update.
     * @return bool true if successful update.
     * @throws ValidationException check if attributes are valid.
     */
    public function update(array $attributes = [], array $options = []): bool
    {
        $validator = Validator::make($attributes, $this->updateRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return parent::update($validator->validated(), $options);
    }

    /**
     * @return string[]
     */
    public function getSortable(): array
    {
        return $this->sortable;
    }

    /**
     * @return string[]
     */
    public function getFilterable(): array
    {
        return $this->filterable;
    }

    public function canSortBy(string $field): bool
    {
        return in_array($field, $this->getSortable()) || in_array('*', $this->getSortable());
    }

    public function canFilterBy(string $field): bool
    {
        return in_array($field, $this->getFilterable()) || in_array('*', $this->getFilterable());
    }

    public function isDateCast(string $key): bool
    {
        return $this->hasCast(
            $key,
            ['date', 'datetime', 'immutable_date', 'immutable_datetime', 'custom_datetime', 'immutable_custom_datetime']
        );
    }

    public function isNumberCast(string $key): bool
    {
        return $this->hasCast($key, ['int', 'integer', 'float', 'real', 'double', 'decimal']);
    }
}
