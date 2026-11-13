<?php

namespace App\Http\Controllers\Admin;

use App\Domain\DefenseRequests\DefenseRequestWorkflow;
use App\Http\Controllers\Controller;
use App\Http\Resources\DefenseRequestResource;
use App\Models\DefenseRequest;
use Illuminate\Http\Request;

/**
 * A coordenação acompanha todas as solicitações de banca e pode arquivar, restaurar
 * e apagar de vez (DefenseRequestPolicy). ?archived=1 lista as arquivadas.
 */
class DefenseRequestController extends Controller
{
    public function __construct(private DefenseRequestWorkflow $workflow) {}

    public function index(Request $request)
    {
        return DefenseRequestResource::collection(
            DefenseRequest::with(['user', 'advisor', 'archivedBy', 'student.advisors'])
                ->when($request->boolean('archived'), fn ($q) => $q->onlyTrashed())
                ->orderByDesc('id')
                ->get()
        );
    }

    public function destroy(Request $request, DefenseRequest $defenseRequest)
    {
        return new DefenseRequestResource($this->loaded($this->workflow->archive($defenseRequest, $request->user())));
    }

    public function restore(Request $request, DefenseRequest $defenseRequest)
    {
        return new DefenseRequestResource($this->loaded($this->workflow->restore($defenseRequest, $request->user())));
    }

    public function forceDestroy(Request $request, DefenseRequest $defenseRequest)
    {
        $this->workflow->destroy($defenseRequest, $request->user());

        return response()->noContent();
    }

    private function loaded(DefenseRequest $request): DefenseRequest
    {
        return $request->load(['user', 'advisor', 'archivedBy', 'student.advisors']);
    }
}
