<?php

namespace App\Http;

use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Filters
{
    public function __construct(protected Builder $query) {}

    public function applyFilters(array $filters): Builder
    {
        $model = $this->query->newModelInstance();
        foreach ($filters as $filter) {
            if (! $model->canFilterBy($filter['field'])) {
                continue;
            }

            $operator = $filter['operator'] ?? null;
            $type = $model->getCasts()[$filter['field']] ?? 'string';

            if (in_array($operator, ['in', 'not in'])) {
                $values = explode('|', $filter['value']);
                $this->query->whereIn($filter['field'], $values, not: $operator === 'not in');
            } elseif (in_array($operator, ['=', '!='])) {
                $this->query->where($filter['field'], $operator, $filter['value']);
            } elseif (in_array($operator, ['like', 'not like'])) {
                $this->query->where($filter['field'], $operator, "%{$filter['value']}%");
            } elseif ($model->isDateCast($filter['field'])) {
                $this->dateFilter($filter);
            } elseif ($model->isNumberCast($filter['field'])) {
                $this->numberFilter($filter);
            } elseif ($type === 'string') {
                $this->query->where($filter['field'], 'like', "%{$filter['value']}%");
            } else {
                throw new Exception("Invalid filter {$filter['field']}");
            }
        }

        return $this->query;
    }

    /**
     * @param  array{field: string, value: mixed}  $filter
     */
    protected function dateFilter(array $filter): Builder
    {
        if (Str::of($filter['value'])->contains('|')) {
            [$min, $max] = $this->explodeMinMax($filter['value']);
            if ($min !== '' && $max !== '') {
                $this->query->whereBetween($filter['field'], [$min, $max]);
            } elseif ($min !== '') {
                $this->query->whereDate($filter['field'], '>=', $min);
            } elseif ($max !== '') {
                $this->query->whereDate($filter['field'], '<=', $max);
            }
        } else {
            $this->query->whereDate($filter['field'], $filter['value']);
        }

        return $this->query;
    }

    /**
     * @param  array{field: string, value: mixed}  $filter
     */
    protected function numberFilter(array $filter): Builder
    {
        if (Str::of($filter['value'])->contains('|')) {
            [$min, $max] = $this->explodeMinMax($filter['value']);
            if ($min !== '' && $max !== '') {
                $this->query->whereBetween($filter['field'], [$min, $max]);
            } elseif ($min !== '') {
                $this->query->where($filter['field'], '>=', $min);
            } elseif ($max !== '') {
                $this->query->where($filter['field'], '<=', $max);
            }
        } else {
            $this->query->where($filter['field'], $filter['value']);
        }

        return $this->query;
    }

    protected function explodeMinMax(string $filter): array
    {
        $minMax = explode('|', $filter);
        array_walk($minMax, 'trim');
        $min = $minMax[0];
        $max = $minMax[1] ?? '';

        return [$min, $max];
    }
}
