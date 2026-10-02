<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Award\AwardCategoryRequest;
use App\Models\AwardCategory;

class AwardCategoryController extends Controller
{
    public function index()
    {
        $categories = AwardCategory::withCount('awards')->orderBy('id')->get();

        return response()->json([
            'data' => $categories->map(fn (AwardCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'awards_count' => $c->awards_count,
            ]),
        ]);
    }

    public function store(AwardCategoryRequest $request)
    {
        $category = AwardCategory::create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    public function update(AwardCategoryRequest $request, AwardCategory $awardCategory)
    {
        $awardCategory->update($request->validated());

        return response()->json(['data' => $awardCategory]);
    }

    public function destroy(AwardCategory $awardCategory)
    {
        if ($awardCategory->awards()->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir uma categoria que possui prêmios.',
            ], 409);
        }

        $awardCategory->delete();

        return response()->json(['message' => 'Categoria excluída com sucesso']);
    }
}
