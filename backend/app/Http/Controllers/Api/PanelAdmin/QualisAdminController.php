<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\StratumQualis;

class QualisAdminController extends Controller
{

    public function allQualis(){
        $stratum = new StratumQualis();
        return $stratum->findAllQualis();
    }

    public function qualis($id){
        $stratum = new StratumQualis();
        return $stratum->findQualis($id);
    }
}
