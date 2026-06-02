<?php

namespace App\Services;

use App\Models\Configuration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

class ConfigurationService
{
    protected const CACHE_PREFIX = 'config_';
    protected const CACHE_TTL = 3600; // 1 hour

    /**
     * Get all configurations.
     *
     * @return Collection
     */
    public function all(): Collection
    {
        return Cache::remember(self::CACHE_PREFIX . 'all', self::CACHE_TTL, function () {
            return Configuration::orderBy('group')->orderBy('key')->get();
        });
    }

    /**
     * Get a specific configuration value.
     *
     * @param string $group
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get(string $group, string $key, $default = null)
    {
        $cacheKey = $this->getCacheKey($group, $key);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($group, $key, $default) {
            $config = Configuration::where('group', $group)->where('key', $key)->first();
            return $config ? $config->casted_value : $default;
        });
    }

    /**
     * Set a configuration value.
     *
     * @param array $data
     * @return Configuration
     */
    public function set(array $data): Configuration
    {
        $config = Configuration::updateOrCreate(
            ['group' => $data['group'], 'key' => $data['key']],
            [
                'value' => $data['value'],
                'type' => $data['type'] ?? 'string',
                'description' => $data['description'] ?? null,
            ]
        );

        $this->clearCache($config->group, $config->key);

        return $config;
    }

    /**
     * Delete a configuration and clear its cache.
     *
     * @param Configuration $configuration
     * @return bool|null
     */
    public function delete(Configuration $configuration): ?bool
    {
        $group = $configuration->group;
        $key = $configuration->key;

        $deleted = $configuration->delete();

        if ($deleted) {
            $this->clearCache($group, $key);
        }

        return $deleted;
    }

    /**
     * Clear cache for a specific configuration.
     *
     * @param string $group
     * @param string $key
     * @return void
     */
    public function clearCache(string $group, string $key): void
    {
        Cache::forget($this->getCacheKey($group, $key));
        Cache::forget(self::CACHE_PREFIX . 'all');
    }

    /**
     * Generate cache key.
     *
     * @param string $group
     * @param string $key
     * @return string
     */
    protected function getCacheKey(string $group, string $key): string
    {
        return self::CACHE_PREFIX . "{$group}_{$key}";
    }
}
