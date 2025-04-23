<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\Subarea;
use App\Models\BaseModel;
use Illuminate\Http\Request;

class AreaController extends BaseApiResourceController
{

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }

    public function store(Request $request)
    {
       $validated = $request->validate([
            'area' => 'required|string|max:255',
            'subarea' => 'required|string|max:255',
        ]);

        $areas = Area::where('area', $request->input('area'))->get();
        if ($areas->isNotEmpty()) {
            return response()->json(['message' => 'Erro: área já cadastrada'], 406);
        }

        $area = Area::create($validated);
        return response()->json($area, 201);
    }

    public function destroy(int $id)
    {
        $area = Area::find($id);
        if (!$area) {
            return response()->json(['message' => 'Área não encontrada'], 404);
        }

        if ($area->users()->exists()) {
            return response()->json(['message' => 'Área vinculada a usuários'], 409);
        }

        $area->delete();
        return response()->json(['message' => 'Área excluída com sucesso'], 200);
    }

    public function subareaPerArea(){
        return Area::with('subarea')->get();
    }
}
