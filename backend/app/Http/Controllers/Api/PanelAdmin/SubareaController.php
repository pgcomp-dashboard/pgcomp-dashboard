<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\BaseModel;
use App\Models\Subarea;

class SubareaController extends BaseApiResourceController{

    protected function modelClass(): string|BaseModel
    {
        return Subarea::class;
    }

    public function destroy(int $id)
    {
        $msg = "Operação não pode ser concluída: usuários cadastrados com essa subárea";

        $subareas = Subarea::where('id', $id)->withCount(['users'])->get();
        if(count($subareas) > 0 and $subareas[0]->users_count == 0){
            return parent::destroy($id);
        }elseif(count($subareas) == 0){
            return abort(406, "subárea não cadastrada");
        }else{
            return abort(406, $msg);
        }
    }
}
