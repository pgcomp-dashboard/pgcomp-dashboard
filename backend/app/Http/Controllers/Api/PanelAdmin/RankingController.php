<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    protected Production $production;
    public function index(Request $request)
    {
        $year1 = $request->query("year1",date("Y") - 1);
        $year2 = $request->query("year2",date("Y"));

        error_log($year1 . " " . $year2);

        $this->production = new Production;
        $ranking = $this->production->findAllProfessorProductionsQualisByYear($year1, $year2);
        if (empty($ranking)) {
            abort(400);
        } else {
            return response()->json([
                'data' => $ranking,
            ]);
        }
    }

}
