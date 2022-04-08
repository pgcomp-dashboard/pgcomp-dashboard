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
}
