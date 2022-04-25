<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Subarea;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StudentsController extends Controller
{
    public function studentsArea()
    {
        //return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];


        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areas();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
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
