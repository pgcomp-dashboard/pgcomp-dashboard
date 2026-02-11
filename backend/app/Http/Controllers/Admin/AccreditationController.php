<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AccreditationDetailResource;
use App\Http\Resources\Admin\AccreditationRankingResource;
use App\Services\Admin\AccreditationService;
use Illuminate\Http\Request;

class AccreditationController extends Controller
{
    protected AccreditationService $accreditationService;

    public function __construct(AccreditationService $accreditationService)
    {
        $this->accreditationService = $accreditationService;
    }

    public function index(Request $request)
    {
        // Se não especificar o periodo pega somente o ano anterior
        $year1 = $request->query("year1", date("Y") - 1);
        $year2 = $request->query("year2", date("Y"));

        $ranking = $this->accreditationService->getAccreditationRanking($year1, $year2);

        return AccreditationRankingResource::collection($ranking);
    }

    public function show(Request $request, int $id)
    {
        // Se não especificar o periodo pega somente o ano anterior
        $year1 = $request->query("year1", date("Y") - 1);
        $year2 = $request->query("year2", date("Y"));

        $details = $this->accreditationService->getAccreditationUserDetails($id, $year1, $year2);

        return new AccreditationDetailResource((object) $details);
    }
}
