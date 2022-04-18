<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Program;

class ProgramsController extends Controller
{
    public function programName()
    {
        // TODO: Retornar o JSON com o nome do programa
        //{
        //  "sigla": "PGCOMP/IC",
        //  "nome": "Programa de pós-graduação em ciência da computação"
        //}

        $keyReturnPattern = ['sigla', "nome"];
        $keysSearch = ['name', 'description'];
        $program = new Program();
        return $program->findAllCoursesByColumns($keysSearch, $keyReturnPattern);
    }
}
