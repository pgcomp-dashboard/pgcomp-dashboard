<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\Area;

class FieldsAdminController extends Controller
{
    public function area($id){
        return (new \App\Models\Area)->findArea($id);
    }

    public function subarea($id){
        return (new \App\Models\Subarea)->findSubarea($id);
    }
}
