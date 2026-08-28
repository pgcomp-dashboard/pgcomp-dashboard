<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserFeaturedProductionResource;
use App\Models\Production;
use App\Models\UsersProductions;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsersProductionsController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    /**
     * Lista as produções favoritadas agrupadas por professor.
     */
    public function getFeatured(Request $request): JsonResponse
    {
        $perPage = max((int) $request->query('per_page', 15), 1);
        $professorId = $request->integer('professor_id');

        $professors = UsersProductions::with('user')
            ->where('is_featured', true)
            ->when($professorId, fn ($query) => $query->where('users_id', $professorId))
            ->select('users_id')
            ->distinct()
            ->orderBy('users_id')
            ->paginate($perPage);

        $featured = UsersProductions::with(['production.publisher'])
            ->where('is_featured', true)
            ->whereIn('users_id', $professors->getCollection()->pluck('users_id'))
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('users_id');

        $data = $professors->getCollection()->map(function (UsersProductions $professor) use ($featured, $request) {
            $productions = $featured->get($professor->users_id, collect());

            return [
                'professor' => [
                    'id' => $professor->user->id,
                    'name' => $professor->user->name,
                ],
                'productions' => UserFeaturedProductionResource::collection($productions)->resolve($request),
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $professors->currentPage(),
                'from' => $professors->firstItem(),
                'last_page' => $professors->lastPage(),
                'per_page' => $professors->perPage(),
                'to' => $professors->lastItem(),
                'total' => $professors->total(),
            ],
            'links' => [
                'first' => $professors->url(1),
                'last' => $professors->url($professors->lastPage()),
                'prev' => $professors->previousPageUrl(),
                'next' => $professors->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Alterna o destaque de uma produção do professor autenticado.
     */
    public function toggleFeatured(Production $production): array
    {
        $this->authorize('feature', $production);

        $isFeatured = $this->userService->toggleFeatured(auth()->user(), $production);

        return [
            'production_id' => $production->id,
            'is_featured' => $isFeatured,
        ];
    }
}
