<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Subarea;

class FieldsAdminController extends Controller
{

    public function allArea(): \Illuminate\Database\Eloquent\Collection
    {
        $area = new Area();
        return $area->findAllArea();
    }

    public function allSubarea(): \Illuminate\Database\Eloquent\Collection
    {
        $subarea = new Subarea();
        return $subarea->findAllSubarea();
    }

    public function area($id) {
        $area = new Area();
        return $area->findArea($id);
    }

    public function subarea($id) {
        $subarea = new Subarea();
        return $subarea->findSubarea($id);
    }
}
