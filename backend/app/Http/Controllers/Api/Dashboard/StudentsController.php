<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentsController extends Controller
{

    public function studentCountPerSubArea(Request $request)
    {
        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        $data = User::userCountPerSubArea($filter);

        return [
            'fields' => array_keys($data),
            'data'   => array_values($data),
        ];
    }

    public function studentCountPerArea(Request $request)
    {
        //return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];

        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        $data = User::userCountPerArea($filter);

        return [
            'fields' => array_keys($data),
            'data'   => array_values($data),
        ];
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
        die("NOT IMPLEMENTED");
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
