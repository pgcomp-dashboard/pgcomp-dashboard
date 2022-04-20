<?php

namespace App\Http;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Filters
{
    public function applyFilters(Builder $query, array $filters): Builder
    {
        $model = $query->newModelInstance();
        foreach ($filters as $filter) {
            if (!$model->canFilterBy($filter['field'])) {
                continue;
            }

            $operator = $filter['operator'] ?? null;
            $type = $model->getCasts()[$filter['field']] ?? 'string';

            if (in_array($operator, ['in', 'not in'])) {
                $values = explode('|', $filter['value']);
                $query->whereIn($filter['field'], $values, not: $operator === 'not in');
            } elseif (in_array($operator, ['=', '!='])) {
                $query->where($filter['field'], $operator, $filter['value']);
            } elseif (in_array($operator, ['like', 'not like'])) {
                $query->where($filter['field'], $operator, "%{$filter['value']}%");
            } elseif ($model->isDateCast($filter['field'])) {
                $this->dateFilter($query, $filter);
            } elseif ($model->isNumberCast($filter['field'])) {
                $this->numberFilter($query, $filter);
            } elseif ($type === 'string') {
                $query->where($filter['field'], 'like', "%{$filter['value']}%");
            } else {
                throw new \Exception("Invalid filter {$filter['field']}");
            }
        }

        return $query;
    }

    /**
     * @param Builder $query
     * @param array{field: string, value: mixed} $filter
     * @return Builder
     */
    protected function dateFilter(Builder $query, array $filter): Builder
    {
        if (Str::of($filter['value'])->contains('|')) {
            $minMax = explode('|', $filter['value']);
            array_walk($minMax, 'trim');
            $min = $minMax[0];
            $max = $minMax[1] ?? '';
            if ($min !== '' && $max !== '') {
                $query->whereBetween($filter['field'], [$min, $max]);
            } elseif ($min !== '') {
                $query->whereDate($filter['field'], '>=', $min);
            } elseif ($max !== '') {
                $query->whereDate($filter['field'], '<=', $max);
            }
        } else {
            $query->whereDate($filter['field'], $filter['value']);
        }
        return $query;
    }

    /**
     * @param Builder $query
     * @param array{field: string, value: mixed} $filter
     * @return Builder
     */
    protected function numberFilter(Builder $query, array $filter): Builder
    {
        if (Str::of($filter['value'])->contains('|')) {
            $minMax = explode('|', $filter['value']);
            array_walk($minMax, 'trim');
            $min = $minMax[0];
            $max = $minMax[1] ?? '';
            if ($min !== '' && $max !== '') {
                $query->whereBetween($filter['field'], [$min, $max]);
            } elseif ($min !== '') {
                $query->where($filter['field'], '>=', $min);
            } elseif ($max !== '') {
                $query->where($filter['field'], '<=', $max);
            }
        } else {
            $query->where($filter['field'], $filter['value']);
        }

        return $query;
    }
}
