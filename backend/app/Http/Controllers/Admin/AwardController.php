<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Award\AwardRequest;
use App\Http\Resources\AwardResource;
use App\Models\Award;
use App\Services\AwardService;

/**
 * Gestão de todos os prêmios pela coordenação. O cadastro é feito pelos
 * próprios usuários em User\AwardController.
 */
class AwardController extends Controller
{
    public function __construct(private AwardService $service)
    {
    }

    public function index()
    {
        $awards = Award::with('category', 'user', 'winners')->orderByDesc('year')->orderByDesc('id')->get();

        return AwardResource::collection($awards);
    }

    public function show(Award $award)
    {
        return new AwardResource($award->load('category', 'user', 'winners'));
    }

    /**
     * Atualiza via POST porque o PHP não lê multipart em PUT.
     */
    public function update(AwardRequest $request, Award $award)
    {
        $updated = $this->service->update(
            $award,
            $request->safe()->except(['attachment', 'remove_attachment']),
            $request->file('attachment'),
            $request->boolean('remove_attachment'),
        );

        return new AwardResource($updated);
    }

    public function destroy(Award $award)
    {
        $this->service->delete($award);

        return response()->json(['message' => 'Prêmio excluído com sucesso']);
    }

    public function attachment(Award $award)
    {
        return $this->service->download($award);
    }
}
