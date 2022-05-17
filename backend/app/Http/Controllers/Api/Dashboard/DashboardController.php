<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function advisors(Request $request)
    {
        $userType = $request->input('user_type');
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            //->whereHas('advisedes') // não lista professores sem orientandos!
            ->withCount(['advisedes' => function (Builder $belongsToMany) use ($userType) {
                if ($userType === 'doutorando') {
                    $belongsToMany->where('course_id', 2);
                } elseif ($userType === 'mestrando') {
                    $belongsToMany->where('course_id', 1);
                } elseif ($userType === '50') {
                    $belongsToMany->whereNull('defended_at');
                } elseif ($userType === '60') {
                    $belongsToMany->whereNotNull('defended_at');
                }
            }])
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_count']);
        });
    }
}
