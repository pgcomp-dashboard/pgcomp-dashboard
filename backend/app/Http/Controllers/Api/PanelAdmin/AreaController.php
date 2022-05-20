<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\BaseModel;

class AreaController extends BaseApiResourceController
{

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }

    public function destroy(int $id)
    {
        $areas = Area::where('id', $id)->withCount(['users'])->get();
        return (count($areas) > 0 and $areas[0]->users_count) ?
            parent::destroy($id) : abort(406);
    }

    public function subareaPerArea(){
        $areas = Area::with('subarea')->get();
        $data = [];
        foreach($areas as $area){
           $subareasName = [];
           foreach($area->subarea as $subarea){
               $subareasName[] = ['subarea_name' => $subarea->subarea_name];
           }
           $data[] = array_merge(["area_name" => $area->area_name], ["subareas" => $subareasName]);
        }
        return $data;
    }
}
