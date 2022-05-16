<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardController extends Controller
{
    const ADVISEDES = 'advisedes';
    const MASTER = 'advisedesMaster';
    const DOCTORATE = 'advisedesDoctorate';

    const COUNTPATTERN = 'advisedes_count';
    const COUNTMASTER = 'advisedes_master_count';
    const COUNTDOCTORATE = 'advisedes_doctorate_count';

    public function advisors()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            ->withCount(self::ADVISEDES)
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, self::COUNTPATTERN]);
        });
    }

    public function advisorsMaster()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            ->withCount(self::MASTER)
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            $item = $item->only([...$attributes, self::COUNTMASTER]);
            return $this->changeToKeyPattern($item, self::COUNTMASTER, self::COUNTPATTERN);
        });
    }

    public function advisorsDoctorate()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            ->withCount(self::DOCTORATE)
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            $item = $item->only([...$attributes, self::COUNTDOCTORATE]);
            return $this->changeToKeyPattern($item, self::COUNTDOCTORATE, self::COUNTPATTERN);
        });
    }

    private function changeToKeyPattern($data, $key, $keyPattern) {
        if(array_key_exists( $key, $data)) {
            $keys = array_keys($data);
            $keys[array_search($key, $keys)] = $keyPattern;
            return array_combine($keys, $data);
        }
        return $data;
    }
}
