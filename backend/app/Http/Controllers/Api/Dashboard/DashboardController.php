<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardController extends Controller
{
    public function advisors()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            //->whereHas('advisedes') // não lista professores sem orientandos!
            ->withCount('advisedes')
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_count']);
        });
    }

    public function advisorsMaster()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            ->withCount('advisedesMaster')
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_master_count']);
        });
    }

    public function advisorsDoctorate()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            ->withCount('advisedesDoctorate')
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_doctorate_count']);
        });
    }
}
