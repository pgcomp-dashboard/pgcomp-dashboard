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
        return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
                'data' => [12, 3, 5,]];

        /*
        $keyReturnPattern = ['fields', 'data'];
        $user = new User();
        $data = $user->areas($keyReturnPattern);

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
        */
    }


    public function studentsSubarea()
    {
        return ['subfields' => ['CG', 'Análise de Dados', 'I.A',],
                'data' => [12, 3, 5,]];

        /*
        $keyReturnPattern = ['subfields', 'data'];
        $user = new User();
        $data = $user->subareas($keyReturnPattern);

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
        */
    }
}
