<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\Subarea;
use App\Models\BaseModel;

class AreaController extends BaseApiResourceController
{

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }

    public function destroy(int $id)
    {
        $msg = "Operação não pode ser concluída: usuários cadastrados com essa área";

        $areas = Area::where('id', $id)->withCount(['usersInSubarea'])->get();
        if(count($areas) > 0 and $areas[0]->users_in_subarea_count == 0){
            $areas = Area::where('id', $id)->with('subarea')->get();
            foreach($areas[0]->subarea as $subarea){
                Subarea::deleteInstance($subarea->id);
            }
            return parent::destroy($id);
        }elseif(count($areas) == 0){
            return abort(406, "área não cadastrada");
        }else{
            return abort(406, $msg);
        }
    }

    public function subareaPerArea(){
        return Area::with('subarea')->get();
    }
}
