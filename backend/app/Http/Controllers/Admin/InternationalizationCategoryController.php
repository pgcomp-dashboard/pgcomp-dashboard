<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Internationalization\CategoryRequest;
use App\Models\InternationalizationCategory;

class InternationalizationCategoryController extends Controller
{
    public function index()
    {
        $categories = InternationalizationCategory::withCount('actions')->orderBy('id')->get();

        return response()->json([
            'data' => $categories->map(fn (InternationalizationCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'actions_count' => $c->actions_count,
            ]),
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $category = InternationalizationCategory::create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    public function update(CategoryRequest $request, InternationalizationCategory $internationalizationCategory)
    {
        $internationalizationCategory->update($request->validated());

        return response()->json(['data' => $internationalizationCategory]);
    }

    public function destroy(InternationalizationCategory $internationalizationCategory)
    {
        if ($internationalizationCategory->actions()->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir uma categoria que possui ações.',
            ], 409);
        }

        $internationalizationCategory->delete();

        return response()->json(['message' => 'Categoria excluída com sucesso']);
    }
}
