<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\User;
use App\Models\BaseModel;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;



class AreaController extends BaseApiResourceController
{

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }

    public function index(Request $request)
    {
        $areas = Area::with(['users' => function ($query) {
            $query->where('type', 'student')
                  ->select('id', 'name', 'email', 'area_id');
        }])->get();

        if ($areas->isEmpty()) {
            throw new NotFoundHttpException('Nenhuma área encontrada');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Áreas encontradas com sucesso',
            'data' => $areas
        ], 200);
    }

    public function show(int $id)
    {
        $area = Area::find($id);

        if (!$area) {
            throw new NotFoundHttpException('Área não encontrada');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Área encontrada com sucesso',
            'data' => $area
        ], 200);
    }
    public function store(Request $request)
    {
       $validated = $request->validate([
            'area' => 'required|string|max:255',
        ]);

        if (Area::where('area', $validated['area'])->exists()) {
            throw new ConflictHttpException('Erro: Área já cadastrada');
        }

        $area = Area::create($validated);

        return response()->json([
        'status' => 'success',
        'message' => 'Área cadastrada com sucesso',
        'data' => $area
        ], 201);
    }

    public function update (Request $request, int $id)
    {
        $area = Area::find($id);

        if (!$area) {
            throw new NotFoundHttpException('Área não encontrada');
        }

        $validated = $request->validate([
            'area' => 'sometimes|required|string|max:255',
        ]);

        $newArea = $validated['area'] ?? $area->area;

        $areaExists = Area::where('area', $newArea)
        ->where('id', '!=', $id)
        ->exists();

        if ($areaExists) {
            throw new ConflictHttpException('Erro: Área já cadastrada com esse nome');
        }

        $combinationExists = Area::where('area', $newArea)
        ->where('id', '!=', $id)
        ->exists();

        if ($combinationExists) {
            throw new ConflictHttpException('Erro: Já existe uma área que contém essa combinação com subarea');
        }

        $area->update([
            'area' => $newArea,
        ]);
            
        return response()->json([
            'status' => 'success',
            'message' => 'Área atualizada com sucesso',
            'data' => $area
        ], 200);
    }

    public function destroy(int $id)
    {
        $area = Area::find($id);

        if (!$area) {
            throw new NotFoundHttpException('Área não cadastrada');
        }

        if ($area->users()->exists()) {
            throw new ConflictHttpException('Erro: Usuários cadastrados nessa área');
        }
        
        $area->delete();

        return response()->json([
        'status' => 'success',
        'message' => 'Área excluída com sucesso'
        ], 200);
    }

    public function subareaPerArea(){
        $areas = Area::select( 'id', 'area', 'subarea')->get();
        if ($areas->isEmpty()) {
            throw new NotFoundHttpException('Nenhuma área encontrada');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Áreas encontradas com sucesso',
            'data' => $areas
        ], 200);
    }
}
