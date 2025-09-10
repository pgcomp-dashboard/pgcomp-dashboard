<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\Production;

class RankingController extends Controller
{
    protected Production $production;
    public function index()
    {
        $this->production = new Production;
        $ranking = $this->production->findAllProfessorProductionsQualisByYear(date("Y") - 4);
        if (empty($ranking)) {
            abort(400);
        } else {
            return response()->json([
                'data' => $ranking,
            ]);
        }
    }

}
