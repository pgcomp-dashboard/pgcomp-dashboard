<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Subarea;

class FieldsAdminController extends Controller
{

    //Area
    public function allArea(): \Illuminate\Database\Eloquent\Collection
    {
        $area = new Area();
        return $area->findAllArea();
    }

    public function area($name): Area
    {
        $area = new Area();
        return $area->findAreaByName($name);
    }

    public function saveArea($request): Area
    {
        return Area::createOrUpdateArea($this->convertJsonToArray($request));
    }

    public function deleteArea($name) {
        $area = new Area();
        return $area->deleteAreaByName($name);
    }

    //Subarea
    public function allSubarea(): \Illuminate\Database\Eloquent\Collection
    {
        $subarea = new Subarea();
        return $subarea->findAllSubarea();
    }

    public function subarea($name): Subarea
    {
        $subarea = new Subarea();
        return $subarea->findSubareaByName($name);
    }

    public function saveSubarea($request): Subarea
    {
        return Subarea::createOrUpdateSubarea($this->convertJsonToArray($request));
    }

    public function deleteSubarea($name){
        $subarea = new Subarea();
        return $subarea->deleteSubareaByName($name);
    }

    private function convertJsonToArray($jsonData): array
    {
        $arrayData = [];
        foreach($jsonData->all() as $key => $value){
            $arrayData[$key] = $value;
        }
        return $arrayData;
    }
}
