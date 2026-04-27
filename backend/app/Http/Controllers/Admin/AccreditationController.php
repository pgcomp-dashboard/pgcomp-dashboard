<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AccreditationDetailResource;
use App\Http\Resources\Admin\AccreditationRankingResource;
use App\Services\Admin\AccreditationService;
use App\Services\ConfigurationService;
use Illuminate\Http\Request;

class AccreditationController extends Controller
{
    protected AccreditationService $accreditationService;
    protected ConfigurationService $configurationService;

    public function __construct(AccreditationService $accreditationService, ConfigurationService $configurationService)
    {
        $this->accreditationService = $accreditationService;
        $this->configurationService = $configurationService;
    }

    public function index(Request $request)
    {
        $year1 = $request->query("year1");
        $year2 = $request->query("year2");

        $ranking = $this->accreditationService->getAccreditationRanking($year1, $year2);

        return AccreditationRankingResource::collection($ranking);
    }

    public function show(Request $request, int $id)
    {
        $year1 = $request->query("year1");
        $year2 = $request->query("year2");

        $details = $this->accreditationService->getAccreditationUserDetails($id, $year1, $year2);

        return new AccreditationDetailResource((object) $details);
    }

    public function getResolutionLink()
    {
        $defaultLink = 'https://pgcomp.ufba.br/';

        $link = $this->configurationService->get('accreditation', 'resolution_link', $defaultLink);

        return response()->json(['url' => $link ?? $defaultLink]);
    }
}
