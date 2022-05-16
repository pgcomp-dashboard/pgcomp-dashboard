<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentsController extends Controller
{
    public function studentsArea(Request $request)
    {
        //return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];

        $selectedFilter = $request->input('selectedFilter');

        $filter = function(Builder $builder) use ($selectedFilter) {
            if ($selectedFilter === 'mestrando') {
                $builder->where('course_id', 1);
            } elseif ($selectedFilter === 'doutorando') {
                $builder->where('course_id', 2);
            } elseif ($selectedFilter === '50') {
                $builder->whereNull('defended_at');
            } elseif ($selectedFilter === '60') {
                $builder->whereNotNull('defended_at');
            }
        };
        $areas = Area::withCount([
            'students' => $filter
        ])->whereHas('students', $filter)
            ->orderBy('area_name')
            ->get();

        return [
            'fields' => $areas->pluck('area_name')->toArray(),
            'data' => $areas->pluck('students_count')->toArray(),
        ];
    }


    public function studentsSubarea()
    {
        //return ['subfields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareas();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];

    }

    public function studentsMasterDegreeAreas()
    {

        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areasMasterFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    public function studentsMasterDegreeSubareas()
    {


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareasMasterFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    public function studentsDoctorateDegreeArea()
    {

        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areasDoctorFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    public function studentsDoctorateDegreeSubareas()
    {


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareasDoctorFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    // Ve se esse atributo vai existir mesmo em User.
    public function studentsActiveAreas()
    {

        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areasActiveFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }


    public function studentsActiveSubareas()
    {


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareasActiveFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    // Ve se esse atributo vai existir mesmo em User.
    public function studentsNotActiveArea()
    {

        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areasNotActiveFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }



    public function studentsNotActiveSubareas()
    {


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareasNotActiveFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    public function studentsCompletedAreas()
    {

        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user-> areasCompletedFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }


    public function studentsCompletedSubareas()
    {


        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareasCompletedFilter();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }
}
