<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Internationalization\ActionRequest;
use App\Http\Resources\InternationalizationActionResource;
use App\Models\InternationalizationAction;
use App\Services\InternationalizationService;

/**
 * Gestão de todas as ações pela coordenação. O cadastro é feito pelos próprios
 * usuários em User\InternationalizationActionController.
 */
class InternationalizationActionController extends Controller
{
    public function __construct(private InternationalizationService $service)
    {
    }

    public function index()
    {
        $actions = InternationalizationAction::with('category', 'user', 'files')
            ->orderByDesc('start_date')->orderByDesc('id')->get();

        return InternationalizationActionResource::collection($actions);
    }

    public function show(InternationalizationAction $internationalizationAction)
    {
        return new InternationalizationActionResource($internationalizationAction->load('category', 'user', 'files'));
    }

    /** Atualiza via POST porque o PHP não lê multipart em PUT. */
    public function update(ActionRequest $request, InternationalizationAction $internationalizationAction)
    {
        $updated = $this->service->update(
            $internationalizationAction,
            $request->safe()->except(['files', 'remove_files']),
            $request->file('files', []),
            $request->input('remove_files', []),
        );

        return new InternationalizationActionResource($updated);
    }

    public function destroy(InternationalizationAction $internationalizationAction)
    {
        $this->service->delete($internationalizationAction);

        return response()->json(['message' => 'Ação excluída com sucesso']);
    }

    public function file(InternationalizationAction $internationalizationAction, string $slot)
    {
        return $this->service->download($internationalizationAction, $slot);
    }
}
