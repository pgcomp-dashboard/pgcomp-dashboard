<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\StratumQualis;

class QualisAdminController extends Controller
{
    public function qualis($id){
        return (new StratumQualis)->findQualis($id);
    }
}
