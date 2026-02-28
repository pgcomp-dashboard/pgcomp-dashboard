<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuration extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get the value casted to its proper type.
     *
     * @return mixed
     */
    public function getCastedValueAttribute()
    {
        switch ($this->type) {
            case 'integer':
            case 'int':
                return (int) $this->value;
            case 'float':
            case 'double':
                return (float) $this->value;
            case 'boolean':
            case 'bool':
                return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
            case 'json':
            case 'array':
                return json_decode($this->value, true);
            default:
                return $this->value;
        }
    }

    /**
     * Helper to get a configuration value easily.
     *
     * @param string $group
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get($group, $key, $default = null)
    {
        return app(\App\Services\ConfigurationService::class)->get($group, $key, $default);
    }

    /**
     * Helper to set a configuration value.
     *
     * @param string $group
     * @param string $key
     * @param mixed $value
     * @param string|null $type
     * @return self
     */
    public static function set($group, $key, $value, $type = null)
    {
        $dataValue = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

        if (!$type) {
            if (is_int($value)) $type = 'integer';
            elseif (is_float($value)) $type = 'float';
            elseif (is_bool($value)) $type = 'boolean';
            elseif (is_array($value) || is_object($value)) $type = 'json';
            else $type = 'string';
        }

        return app(\App\Services\ConfigurationService::class)->set([
            'group' => $group,
            'key' => $key,
            'value' => $dataValue,
            'type' => $type,
        ]);
    }
}

// use App\Models\Configuration;

// // 1. Get the complex rule (returns an array because of the 'json' type)
// $rule = Configuration::get('evaluation', 'min_production_requirement', [
//     'min' => 3,
//     'types' => ['a1', 'a2', 'a3']
// ]);

// // 2. Query productions that match any of those types
// $count = $user->productions()
//     ->whereIn('stratum', $rule['types'])
//     ->count();

// // 3. Compare with the required minimum
// if ($count >= $rule['min']) {
//     // Approved!
// } else {
//     // Not enough entries...
// }
