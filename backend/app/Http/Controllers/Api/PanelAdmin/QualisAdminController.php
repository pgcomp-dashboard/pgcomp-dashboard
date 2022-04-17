<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\StratumQualis;
use function PHPUnit\Framework\isJson;

class QualisAdminController extends Controller
{

    public function allQualis(){
        $stratum = new StratumQualis();
        return $stratum->findAllQualis();
    }

    public function qualis($code) {
        $stratum = new StratumQualis();
        return $stratum->findQualis($code);
    }

    public function saveQualis($request): StratumQualis
    {
        return StratumQualis::createOrUpdateStratumQualis($this->convertJsonToArray($request));
    }

    public function deleteQualis($code) {
        $stratum = new StratumQualis();
        return $stratum->deleteStratumQualis($code);
    }

    private function convertJsonToArray($jsonData)
    {
        $arrayData = [];
        foreach($jsonData->all() as $key => $value){
            $arrayData[$key] = $value;
        }
        return $arrayData;
    }
}
